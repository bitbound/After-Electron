import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Connectivity from "./Connectivity";
import * as SocketDataIO from "./SocketDataIO";
import * as UI from "./UI";
import { ConnectedClient } from "./Models/ConnectedClient";
import { ConnectionTypes } from "./Models/ConnectionTypes";
import { KnownServer } from "./Models/KnownServer";

export var ClientConnections:Array<ConnectedClient> = new Array<ConnectedClient>();

export var OutboundConnection = new class OutboundConnection {
    TargetServerID: string;
    ConnectionType: ConnectionTypes;
    IsDisconnectExpected: boolean = false;
    Socket: net.Socket;
    Server: KnownServer;
    IsConnected():boolean{
        if (this.Socket == null || this.Socket.writable == false || this.Socket.readable == false){
            return false;
        }
        else {
            return true;
        }
    }
}
export var LocalServer = new class LocalServer {
    Server: net.Server;
    IsShutdownExpected: boolean = false;
    ID: string = Storage.ServerSettings.ServerID;
    IsListening():boolean{
        if (this.Server != null && this.Server.listening){
            return true;
        }
        else {
            return false;
        }
    }
}
export var ServerToServerConnections: Array<net.Socket> = new Array<net.Socket>();


export async function FindClientToServerConnection():Promise<void>{
    var promise = new Promise<void>(async function(resolve, reject){
        UI.AddSystemMessage("Attempting to find a server.", 1);
        for (var i = 0; i < Storage.KnownServers.length; i++){
            try {
                var server = Storage.KnownServers[i];
                if (server.ID == LocalServer.ID) {
                    continue;
                }
                if (await Connectivity.ConnectToServer(server, ConnectionTypes.ClientToServer))
                {
                    UI.AddSystemMessage("Connected to server.", 1);
                    break;
                }
                else {
                    Storage.KnownServers[i].BadConnectionAttempts++;
                }
            }
            catch (ex) {
                Storage.KnownServers[i].BadConnectionAttempts++;
            }
        }
        if (OutboundConnection.IsConnected() == false){
            UI.AddSystemMessage("Unable to find a server.  Try connecting manually later.", 1);
        }
        resolve();
    });
}
export async function FindServerToServerConnection(){
    var connected = false;
    for (var i = 0; i < Storage.KnownServers.length; i++){
        try {
            if (await ConnectToServer(Storage.KnownServers[i], ConnectionTypes.ServerToServer)){
                connected = true;
                SocketDataIO.SendHelloFromServerToServer();
                break;
            }
        }
        catch (ex) {
            continue;
        }
    }
    if (!connected)
    {
        Utilities.WriteDebug("Unable to create server-to-server connection.", 1);
    }
}
export async function ConnectToServer(server:KnownServer, connectionType:ConnectionTypes):Promise<boolean> {
        var promise = new Promise<boolean>(function(resolve, reject){
            try {
                OutboundConnection.IsDisconnectExpected = true;
                var socket = net.connect(server.Port, server.Host, ()=>{
                    OutboundConnection.IsDisconnectExpected = false;
                    server.BadConnectionAttempts = 0;
                    Utilities.UpdateAndPrepend(Storage.KnownServers, server, ["IP", "Port"]);
                    if (connectionType == ConnectionTypes.ClientToServer){
                        OutboundConnection.ConnectionType = connectionType;
                        OutboundConnection.Server = server;
                        SocketDataIO.SendHelloFromClientToServer();
                    }
                    else if (connectionType == ConnectionTypes.ServerToServer){
                        SocketDataIO.SendHelloFromServerToServer();
                    }
                    resolve(true);
                });
                if (connectionType == ConnectionTypes.ClientToServer){
                    OutboundConnection.Socket = socket;
                }
                else if (connectionType == ConnectionTypes.ServerToServer){
                    ServerToServerConnections.push(socket);
                }
                socket.on("error", async (err:Error)=>{
                    Utilities.Log("Socket error: " + JSON.stringify(err));
                    Utilities.WriteDebug("Socket error.", 1);
                    if (connectionType == ConnectionTypes.ClientToServer){
                        if (!OutboundConnection.IsDisconnectExpected) {
                            await Connectivity.FindClientToServerConnection();
                        }
                    }
                    resolve(false);
                });
                socket.on("close", async(had_error)=>{
                    Utilities.Log("Socket closed.");
                    Utilities.WriteDebug("Socket closed.", 1);
                    if (connectionType == ConnectionTypes.ClientToServer){
                        if (!OutboundConnection.IsDisconnectExpected) {
                            await Connectivity.FindClientToServerConnection();
                        }
                    }
                })
                socket.on("data", (data)=>{
                    try
                    {
                        var jsonData = JSON.parse(data.toString());
                        if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                            Utilities.WriteDebug("Already received from server: " + JSON.stringify(jsonData), 1);
                            return;
                        }
                        Utilities.WriteDebug("Received from server: " + JSON.stringify(jsonData), 1);
                        SocketDataIO.Broadcast(jsonData);
                        eval("SocketDataIO.Receive" + jsonData.Type + "(jsonData, this)");
                    }
                    catch (ex) {
                        Utilities.Log(JSON.stringify(ex));
                    }
                });
            }
            catch (ex){
                return resolve(false);
            }
        })
    return promise;
}

export async function StartServer() {
    var server = net.createServer(function(socket){
        socket.on("data", (data)=>{
            try
            {
                var jsonData = JSON.parse(data.toString());
                if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                    Utilities.WriteDebug("Already received from client: " + JSON.stringify(jsonData), 1);
                    return;
                }
                Utilities.WriteDebug("Received from client: " + JSON.stringify(jsonData), 1);
                SocketDataIO.Broadcast(jsonData);
                if (Storage.ClientSettings.IsMultiplayerEnabled) {
                    eval("SocketDataIO.Receive" + jsonData.Type + "(jsonData, socket)");
                }
            }
            catch (ex) {
                Utilities.Log(JSON.stringify(ex));
            }
        });
        socket.on("error", (err:Error)=>{
            Utilities.Log(JSON.stringify(err));
            var index = Connectivity.ClientConnections.findIndex(x=>x.Socket == socket);
            if (index > -1){
                Connectivity.ClientConnections.splice(index, 1);
            }
            var index = Connectivity.ServerToServerConnections.findIndex(x=>x == socket);
            if (index > -1){
                Connectivity.ServerToServerConnections.splice(index, 1);
            }
            UI.RefreshUI();
        })
        socket.on("close", ()=>{
            var index = Connectivity.ClientConnections.findIndex(x=>x.Socket == socket);
            if (index > -1){
                Connectivity.ClientConnections.splice(index, 1);
            }
            var index = Connectivity.ServerToServerConnections.findIndex(x=>x == socket);
            if (index > -1){
                Connectivity.ServerToServerConnections.splice(index, 1);
            }
            UI.RefreshUI();
        })
    });
    server.on("close", function(){
        if (!Connectivity.LocalServer.IsShutdownExpected){
            setTimeout(() => {
                server.close();
                server.listen(Storage.ServerSettings.ListeningPort);
            }, 1000);
        }
    })
    server.on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
            Utilities.Log('TCP Server: Address in use.  Retrying...');
            setTimeout(() => {
                server.close();
                server.listen(Storage.ServerSettings.ListeningPort);
            }, 1000);
        }
        Utilities.Log(JSON.stringify(e));
    });
    server.listen(Storage.ServerSettings.ListeningPort, function(){
        Utilities.Log("TCP server started.");
    });
    Connectivity.LocalServer.Server = server;
    await FindServerToServerConnection();
};
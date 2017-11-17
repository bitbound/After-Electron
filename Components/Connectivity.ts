import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Connectivity from "./Connectivity";
import * as SocketDataIO from "./SocketDataIO";
import * as UI from "./UI";
import { ConnectedClient } from "./Models/ConnectedClient";
import { ConnectionTypes } from "./Models/ConnectionTypes";
import { KnownServer } from "./Models/KnownServer";

export var InboundConnections:Array<ConnectedClient> = new Array<ConnectedClient>();

export var OutboundConnection = new class OutboundConnection {
    TargetServerID: string;
    ConnectionType: ConnectionTypes;
    IsDisconnectExpected: boolean = false;
    Socket: NodeJS.Socket;
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
export var ServerToServerConnections: Array<NodeJS.Socket> = new Array<NodeJS.Socket>();


export async function FindServer():Promise<void>{
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
        if (Connectivity.OutboundConnection.IsConnected() == false){
            UI.AddSystemMessage("Unable to find a server.  Try connecting manually later.", 1);
        }
        resolve();
    });
}
export async function ConnectToServer(server:KnownServer, connectionType:ConnectionTypes):Promise<boolean> {
        var promise = new Promise<boolean>(function(resolve, reject){
            try {
                var socket = net.connect(server.Port, server.Host, ()=>{
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
                socket.on("error", (err:Error)=>{
                    if (connectionType == ConnectionTypes.ClientToServer){
                        // TODO
                    }
                    else if (connectionType == ConnectionTypes.ServerToServer){
                        // TODO
                    }
                    resolve(false);
                });
                socket.on("close", function(had_error){
                    if (connectionType == ConnectionTypes.ClientToServer){
                        // TODO
                    }
                    else if (connectionType == ConnectionTypes.ServerToServer){
                        // TODO
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
export function StartServer() {
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
            var index = Connectivity.InboundConnections.findIndex(x=>x.Socket == socket);
            Connectivity.InboundConnections.splice(index, 1);
            UI.RefreshUI();
        })
        socket.on("close", ()=>{
            var index = Connectivity.InboundConnections.findIndex(x=>x.Socket == socket);
            Connectivity.InboundConnections.splice(index, 1);
            UI.RefreshUI();
        })
        var client = new ConnectedClient();
        client.Socket = socket;
        Connectivity.InboundConnections.push(client);
        UI.RefreshUI();
        Utilities.Log(`Connection received from ${socket.remoteAddress}.`);
        SocketDataIO.SendHelloFromServerToClient();
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
};
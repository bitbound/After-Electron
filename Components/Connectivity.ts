import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Connectivity from "./Connectivity";
import * as SocketDataIO from "./SocketDataIO";
import * as UI from "./UI";
import { ConnectedClient } from "../Models/ConnectedClient";
import { ConnectionTypes } from "../Models/ConnectionTypes";
import { KnownServer } from "../Models/KnownServer";

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


export async function FindClientToServerConnection(){
    UI.AddSystemMessage("Attempting to find a client-to-server connection.", 1);
    for (var i = 0; i < Storage.KnownServers.length; i++){
        try {
            var server = Storage.KnownServers[i];
            if (server.ID == Storage.ServerSettings.ServerID) {
                Utilities.UpdateAndAppend(Storage.KnownServers, server, ["Host", "Port"]);
                continue;
            }
            var socket = await Connectivity.ConnectToServer(server, ConnectionTypes.ClientToServer);
            if (socket)
            {
                UI.AddSystemMessage("Connected to server.", 1);
                break;
            }
            else {
                Storage.KnownServers[i].BadConnectionAttempts++;
                Utilities.UpdateAndAppend(Storage.KnownServers, server, ["Host", "Port"]);
            }
        }
        catch (ex) {
            Storage.KnownServers[i].BadConnectionAttempts++;
            Utilities.UpdateAndAppend(Storage.KnownServers, Storage.KnownServers[i], ["Host", "Port"]);
            continue;
        }
    }
    if (OutboundConnection.IsConnected() == false){
        UI.AddSystemMessage("Unable to find a client-to-server connection.  Try connecting manually later.", 1);
    }
}
export async function FindServerToServerConnection(){
    UI.AddSystemMessage("Attempting to find a server-to-server connection.", 1);
    var connected = false;
    for (var i = 0; i < Storage.KnownServers.length; i++){
        try {
            if (Storage.KnownServers[i].ID == Storage.ServerSettings.ServerID){
                continue;
            }
            if (await ConnectToServer(Storage.KnownServers[i], ConnectionTypes.ServerToServer)) {
                connected = true;
                break;
            }
            else {
                Storage.KnownServers[i].BadConnectionAttempts++;
                Utilities.UpdateAndAppend(Storage.KnownServers, Storage.KnownServers[i], ["Host", "Port"]);
            }
        }
        catch (ex) {
            Storage.KnownServers[i].BadConnectionAttempts++;
            Utilities.UpdateAndAppend(Storage.KnownServers, Storage.KnownServers[i], ["Host", "Port"]);
            continue;
        }
    }
    if (!connected)
    {
        UI.AddSystemMessage("Unable to find a server-to-server connection.", 1);
    }
}
export async function ConnectToServer(server:KnownServer, connectionType:ConnectionTypes):Promise<boolean> {
        var promise = new Promise<boolean>(function(resolve, reject){
            try {
                OutboundConnection.IsDisconnectExpected = true;
                var socket = net.connect(server.Port, server.Host, ()=>{
                    if (Utilities.IsLocalIP(socket.remoteAddress)){
                        Utilities.UpdateAndAppend(Storage.KnownServers, server, ["Host", "Port"]);
                        resolve(false);
                        return;
                    }
                    OutboundConnection.IsDisconnectExpected = false;
                    server.BadConnectionAttempts = 0;
                    Utilities.UpdateAndPrepend(Storage.KnownServers, server, ["Host", "Port"]);
                    if (connectionType == ConnectionTypes.ClientToServer){
                        OutboundConnection.ConnectionType = connectionType;
                        OutboundConnection.Server = server;
                        OutboundConnection.Socket = socket;
                        SocketDataIO.SendHelloFromClientToServer(socket);
                    }
                    else if (connectionType == ConnectionTypes.ServerToServer){
                        SocketDataIO.SendHelloFromServerToServer(server, socket);
                    }
                    resolve(true);
                });
                socket.on("error", (err:Error)=>{
                    Utilities.Log("Socket error: " + JSON.stringify(err));
                    Utilities.WriteDebug("Socket error.", 1);
                    if (connectionType == ConnectionTypes.ClientToServer){
                        if (!OutboundConnection.IsDisconnectExpected) {
                            resolve(null);
                            UI.AddSystemMessage("Client disconnected from server unexpectedly.", 1);
                        }
                    }
                    else if (connectionType == ConnectionTypes.ServerToServer){
                        var index = ServerToServerConnections.findIndex(x=>x==socket);
                        if (index > -1){
                            ServerToServerConnections.splice(index, 1);
                            UI.RefreshUI();
                        }
                    }
                    resolve(false);
                });
                socket.on("close", (had_error)=>{
                    Utilities.Log("Socket closed.");
                    Utilities.WriteDebug("Socket closed.", 1);
                    if (connectionType == ConnectionTypes.ClientToServer){
                        if (!OutboundConnection.IsDisconnectExpected) {
                            resolve(false);
                            UI.AddSystemMessage("Client disconnected from server unexpectedly.", 1);
                        }
                    }
                    else if (connectionType == ConnectionTypes.ServerToServer){
                        var index = ServerToServerConnections.findIndex(x=>x==socket);
                        if (index > -1){
                            ServerToServerConnections.splice(index, 1);
                            UI.RefreshUI();
                        }
                    }
                    resolve(false);
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
                        if (jsonData.TargetServerID != Storage.ServerSettings.ServerID && jsonData.ShouldBroadcast != false){
                            SocketDataIO.Broadcast(jsonData);
                        }
                        eval("SocketDataIO.Receive" + jsonData.Type + "(jsonData, socket)");
                    }
                    catch (ex) {
                        Utilities.Log(ex.stack);
                    }
                });
            }
            catch (ex){
                resolve(false);
            }
        })
    return promise;
}

export async function StartServer() {
    var server = net.createServer(function(socket){
        if (Utilities.IsLocalIP(socket.remoteAddress)) {
            return;
        }
        socket.on("data", (data)=>{
            try
            {
                var jsonData = JSON.parse(data.toString());
                if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                    Utilities.WriteDebug("Already received from client: " + JSON.stringify(jsonData), 1);
                    return;
                }
                Utilities.WriteDebug("Received from client: " + JSON.stringify(jsonData), 1);
                if (jsonData.TargetServerID != Storage.ServerSettings.ServerID && jsonData.ShouldBroadcast != false){
                    SocketDataIO.Broadcast(jsonData);
                }
                eval("SocketDataIO.Receive" + jsonData.Type + "(jsonData, socket)");
            }
            catch (ex) {
                Utilities.Log(ex.stack);
            }
        });
        socket.on("error", (err:Error)=>{
            Utilities.Log(err.stack);
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
            Utilities.WriteDebug('TCP Server Error: Port already in use.', 1);
            
        }
        Utilities.Log(e.stack);
    });
    server.listen(Storage.ServerSettings.ListeningPort, function(){
        Utilities.Log("TCP server started.");
    });
    Connectivity.LocalServer.Server = server;
    await FindServerToServerConnection();
};
import * as net from "net";
import {UI, SocketDataIO, Connectivity, Utilities, Storage} from "./Index";
import { ConnectedClient, ConnectionTypes, KnownServer, MessageCounter } from "../Models/Index";

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
    var appendServers = [];
    for (var i = 0; i < Storage.KnownServers.length; i++){
        var server = Storage.KnownServers[i];
        try {
            if (server.ID == Storage.ServerSettings.ServerID) {
                appendServers.push(server);
                continue;
            }
            var socket = await Connectivity.ConnectToServer(server, ConnectionTypes.ClientToServer);
            if (socket)
            {
                UI.AddSystemMessage("Client-to-server connection successful.", 1);
                break;
            }
            else {
                server.BadConnectionAttempts++;
                appendServers.push(server);
            }
        }
        catch (ex) {
            server.BadConnectionAttempts++;
            appendServers.push(server);
            continue;
        }
    }
    appendServers.forEach(value=>{
        Utilities.UpdateAndAppend(Storage.KnownServers, value, ["Host", "Port"]);
    })
    if (OutboundConnection.IsConnected() == false){
        UI.AddSystemMessage("Unable to find a client-to-server connection.  Try connecting manually later.", 1);
    }
}
export async function FindServerToServerConnection(){
    UI.AddSystemMessage("Attempting to find a server-to-server connection.", 1);
    var connected = false;
    var appendServers = [];
    for (var i = 0; i < Storage.KnownServers.length; i++){
        try {
            if (Storage.KnownServers[i].ID == Storage.ServerSettings.ServerID){
                continue;
            }
            if (await ConnectToServer(Storage.KnownServers[i], ConnectionTypes.ServerToServer)) {
                UI.AddSystemMessage("Server-to-server connection successful.", 1);
                connected = true;
                break;
            }
            else {
                Storage.KnownServers[i].BadConnectionAttempts++;
                appendServers.push(Storage.KnownServers[i]);
            }
        }
        catch (ex) {
            Storage.KnownServers[i].BadConnectionAttempts++;
            appendServers.push(Storage.KnownServers[i]);
            continue;
        }
    }
    appendServers.forEach(value=>{
        Utilities.UpdateAndAppend(Storage.KnownServers, value, ["Host", "Port"]);
    })
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
                        ServerToServerConnections.push(socket);
                        UI.RefreshUI();
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
                        if (!SocketDataIO.CheckMessageCounter(socket)){
                            return;
                        }
                        
                        // Sometimes, multiple messages are received in the same event (at least on LAN).
                        // This ensures that the JSON objects are split and parsed separately.
                        var messages = SocketDataIO.SplitJSONObjects(data.toString());

                        for (var i = 0; i < messages.length; i++){
                            var jsonData = JSON.parse(messages[i]);
                            if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                                Utilities.WriteDebug(`Already received from server (${socket.remoteAddress}): ` + JSON.stringify(jsonData), 1);
                                continue;
                            }
                            Utilities.WriteDebug(`Received from server (${socket.remoteAddress}): ` + JSON.stringify(jsonData), 1);
                            if (jsonData.TargetServerID != Storage.ServerSettings.ServerID && jsonData.ShouldBroadcast != false){
                                SocketDataIO.Broadcast(jsonData);
                            }
                            SocketDataIO["Receive" + jsonData.Type](jsonData, socket);
                        }
                       
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
    Storage.ServerSettings.ServerID = Storage.ServerSettings.ServerID || Utilities.CreateGUID();
    var server = net.createServer(function(socket){
        if (Utilities.IsLocalIP(socket.remoteAddress)) {
            return;
        }
        socket.on("data", (data)=>{
            try
            {
                if (!SocketDataIO.CheckMessageCounter(socket)){
                    return;
                }
                
                // Sometimes, multiple messages are received in the same event (at least on LAN).
                // This ensures that the JSON objects are split and parsed separately.
                var messages = SocketDataIO.SplitJSONObjects(data.toString());
                
                for (var i = 0; i < messages.length; i++){ 
                    var jsonData = JSON.parse(messages[i]);
                    if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                        Utilities.WriteDebug(`Already received from client (${socket.remoteAddress}): ` + JSON.stringify(jsonData), 1);
                        return;
                    }
                    Utilities.WriteDebug(`Received from client (${socket.remoteAddress}): ` + JSON.stringify(jsonData), 1);
                    if (jsonData.TargetServerID != Storage.ServerSettings.ServerID && jsonData.ShouldBroadcast != false){
                        SocketDataIO.Broadcast(jsonData);
                    }
                    SocketDataIO["Receive" + jsonData.Type](jsonData, socket);
                }
               
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
        Utilities.WriteDebug("TCP server started.", 1);
    });
    Connectivity.LocalServer.Server = server;
    await FindServerToServerConnection();
};
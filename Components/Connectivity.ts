import * as net from "net";
import { UI, SocketDataIO, Connectivity, Utilities, Storage } from "./All";
import { ConnectedClient, ConnectionTypes, KnownServer, MessageCounter } from "../Models/All";

export var ClientConnections: Array<ConnectedClient> = new Array<ConnectedClient>();

export var OutboundConnection = new class OutboundConnection {
    TargetServerID: string;
    ConnectionType: ConnectionTypes;
    IsDisconnectExpected: boolean = false;
    Socket: net.Socket;
    Server: KnownServer;
    IsConnected(): boolean {
        if (this.Socket == null || this.Socket.writable == false || this.Socket.readable == false) {
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
    IsListening(): boolean {
        if (this.Server != null && this.Server.listening) {
            return true;
        }
        else {
            return false;
        }
    }
}

export var ServerToServerConnections: Array<net.Socket> = new Array<net.Socket>();
export var IsConnecting: boolean = false;

export async function ConnectToServer(server: KnownServer, connectionType: ConnectionTypes): Promise<boolean> {
    var promise = new Promise<boolean>(function (resolve, reject) {
        try {
            IsConnecting = true;
            var socket = net.connect(server.Port, server.Host, () => {
                socket["id"] = Utilities.CreateGUID();
                IsConnecting = false;
                server.BadConnectionAttempts = 0;
                Utilities.UpdateAndPrepend(Storage.KnownServers, server, ["Host", "Port"]);
                if (connectionType == ConnectionTypes.ClientToServer) {
                    OutboundConnection.ConnectionType = connectionType;
                    OutboundConnection.Server = server;
                    OutboundConnection.Socket = socket;
                    SocketDataIO.SendHelloFromClientToServer(socket);
                }
                else if (connectionType == ConnectionTypes.ServerToServer) {
                    ServerToServerConnections.push(socket);
                    UI.RefreshConnectivityBar();
                    SocketDataIO.SendHelloFromServerToServer(server, socket);
                }
                resolve(true);
            });
            socket.on("error", (err: Error) => {
                Utilities.Log("Socket error: " + JSON.stringify(err));
                UI.AddDebugMessage("Socket error.", null, 1);
                if (connectionType == ConnectionTypes.ClientToServer) {
                    if (!IsConnecting) {
                        resolve(null);
                        UI.AddSystemMessage("Client disconnected from server unexpectedly.  Try reconnecting later.", 1);
                    }
                }
                else if (connectionType == ConnectionTypes.ServerToServer) {
                    Utilities.RemoveFromArray(ServerToServerConnections, value=>value["id"] == socket["id"]);
                    UI.RefreshConnectivityBar();
                }
                resolve(false);
            });
            socket.on("close", (had_error) => {
                Utilities.Log("Socket closed.");
                UI.AddDebugMessage("Socket closed.", null, 1);
                if (connectionType == ConnectionTypes.ClientToServer) {
                    if (!IsConnecting) {
                        resolve(false);
                        UI.AddSystemMessage("Client disconnected from server unexpectedly.  Try reconnecting later.", 1);
                    }
                }
                else if (connectionType == ConnectionTypes.ServerToServer) {
                    Utilities.RemoveFromArray(ServerToServerConnections, value=>value["id"] == socket["id"]);
                    UI.RefreshConnectivityBar();
                    if (ServerToServerConnections.length == 0 && !IsConnecting) {
                        UI.AddSystemMessage("All server-to-server connections lost.  Try reconnecting later.", 1);
                    }
                }
                resolve(false);
            })
            socket.on("data", (data) => {
                try {
                    if (!SocketDataIO.CheckMessageCounter(socket)) {
                        return;
                    }
                    // Sometimes, multiple messages are received in the same event (at least on LAN).
                    // This ensures that the JSON objects are split and parsed separately.
                    var messages = SocketDataIO.SplitJSONObjects(data.toString());

                    for (var i = 0; i < messages.length; i++) {
                        var jsonData = JSON.parse(messages[i]);
                        if (SocketDataIO.HaveYouGotten(jsonData.ID)) {
                            UI.AddDebugMessage(`Already received from server (${socket.remoteAddress}): `, jsonData, 1);
                            continue;
                        }
                        UI.AddDebugMessage(`Received from server (${socket.remoteAddress}): `, jsonData, 1);
                        if (jsonData.TargetServerID != Storage.ConnectionSettings.ServerID && jsonData.ShouldBroadcast != false) {
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
        catch (ex) {
            resolve(false);
        }
    })
    return promise;
}

export async function FindClientToServerConnection() {
    UI.AddSystemMessage("Attempting to find a client-to-server connection.", 1);
    var appendServers = [];
    var removeServers = [];
    for (var i = 0; i < Storage.KnownServers.length; i++) {
        var server = Storage.KnownServers[i];
        try {
            if (server.ID == Storage.ConnectionSettings.ServerID) {
                appendServers.push(server);
                continue;
            }
            if (
                Storage.BlockedServers.some((value) => {
                    return value.Host == server.Host && value.Port == server.Port;
                })
            ) {
                removeServers.push(server);
                continue;
            }
            if (await Connectivity.ConnectToServer(server, ConnectionTypes.ClientToServer)) {
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
    appendServers.forEach(value => {
        Utilities.UpdateAndAppend(Storage.KnownServers, value, ["Host", "Port"]);
    })
    removeServers.forEach(value => {
        var index = Storage.KnownServers.indexOf(value);
        Storage.KnownServers.splice(index, 1);
    })
    if (OutboundConnection.IsConnected() == false) {
        UI.AddSystemMessage("Unable to find a client-to-server connection.  Try reconnecting later.", 1);
    }
    UI.RefreshConnectivityBar();
    for (var i = Storage.KnownServers.length - 1; i >= 0; i--) {
        if (Storage.KnownServers[i].BadConnectionAttempts > Storage.ConnectionSettings.MaxConnectionAttempts) {
            Storage.KnownServers.splice(i, 1);
        }
    }
}

export async function FindServerToServerConnection() {
    UI.AddSystemMessage("Attempting to find a server-to-server connection.", 1);
    var connected = false;
    var appendServers = [];
    var removeServers = [];
    for (var i = 0; i < Storage.KnownServers.length; i++) {
        var server = Storage.KnownServers[i];
        try {
            if (server.ID == Storage.ConnectionSettings.ServerID) {
                continue;
            }
            if (
                Storage.BlockedServers.some((value) => {
                    return value.Host == server.Host && value.Port == server.Port;
                })
            ) {
                removeServers.push(server);
                continue;
            }
            if (await ConnectToServer(server, ConnectionTypes.ServerToServer)) {
                UI.AddSystemMessage("Server-to-server connection successful.", 1);
                connected = true;
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
    appendServers.forEach(value => {
        Utilities.UpdateAndAppend(Storage.KnownServers, value, ["Host", "Port"]);
    })
    removeServers.forEach(value => {
        var index = Storage.KnownServers.indexOf(value);
        Storage.KnownServers.splice(index, 1);
    })
    
    UI.RefreshConnectivityBar();
    for (var i = Storage.KnownServers.length - 1; i >= 0; i--) {
        if (Storage.KnownServers[i].BadConnectionAttempts > Storage.ConnectionSettings.MaxConnectionAttempts) {
            Storage.KnownServers.splice(i, 1);
        }
    }
    if (!connected) {
        UI.AddSystemMessage("Unable to find a server-to-server connection.  Try reconnecting later.", 1);
    }
    else {
        SocketDataIO.SendServerReachTest();
    }
}

export async function RefreshConnections(){
    if (Storage.ConnectionSettings.IsServerEnabled && Connectivity.LocalServer.IsListening() == false) {
        await Connectivity.StartServer();
    }
    if (Storage.ConnectionSettings.IsServerEnabled && ServerToServerConnections.length == 0 && Storage.ConnectionSettings.IsNetworkSupport){
        await FindServerToServerConnection();
    }
    if (Storage.ConnectionSettings.IsClientEnabled && !OutboundConnection.IsConnected()){
        await FindClientToServerConnection();
    }
}

export async function StartServer() {
    Storage.ConnectionSettings.ServerID = Storage.ConnectionSettings.ServerID || Utilities.CreateGUID();
    var server = net.createServer(function (socket) {
        //if (Utilities.IsLocalIP(socket.remoteAddress) && socket.remotePort == Storage.ConnectionSettings.ServerListeningPort) {
        //    return;
        //}
        socket["id"] = Utilities.CreateGUID();
        socket.on("data", (data) => {
            try {
                if (!SocketDataIO.CheckMessageCounter(socket)) {
                    return;
                }

                // Sometimes, multiple messages are received in the same event (at least on LAN).
                // This ensures that the JSON objects are split and parsed separately.
                var messages = SocketDataIO.SplitJSONObjects(data.toString());

                for (var i = 0; i < messages.length; i++) {
                    var jsonData = JSON.parse(messages[i]);
                    if (SocketDataIO.HaveYouGotten(jsonData.ID)) {
                        UI.AddDebugMessage(`Already received from client (${socket.remoteAddress}): `, jsonData, 1);
                        return;
                    }
                    UI.AddDebugMessage(`Received from client (${socket.remoteAddress}): `, jsonData, 1);
                    if (jsonData.TargetServerID != Storage.ConnectionSettings.ServerID && jsonData.ShouldBroadcast != false) {
                        SocketDataIO.Broadcast(jsonData);
                    }
                    SocketDataIO["Receive" + jsonData.Type](jsonData, socket);
                }

            }
            catch (ex) {
                Utilities.Log(ex.stack);
            }
        });
        socket.on("error", (err: Error) => {
            Utilities.Log(err.stack);
            Utilities.RemoveFromArray(ClientConnections, value=>value["Socket"]["id"] == socket["id"]);
            Utilities.RemoveFromArray(ServerToServerConnections, value=>value["id"] == socket["id"]);
            UI.RefreshConnectivityBar();
        })
        socket.on("close", () => {
            Utilities.RemoveFromArray(ClientConnections, value=>value["Socket"]["id"] == socket["id"]);
            Utilities.RemoveFromArray(ServerToServerConnections, value=>value["id"] == socket["id"]);
            UI.RefreshConnectivityBar();
        })
    });
    server.on("close", function () {
        if (!Connectivity.LocalServer.IsShutdownExpected) {
            setTimeout(() => {
                server.close();
                server.listen(Storage.ConnectionSettings.ServerListeningPort);
            }, 1000);
        }
    })
    server.on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
            UI.AddDebugMessage('TCP Server Error: Port already in use.', null, 1);
        }
        Utilities.Log(e.stack);
    });
    server.listen(Storage.ConnectionSettings.ServerListeningPort, function () {
        UI.AddDebugMessage("TCP server started.", null, 1);
    });
    Connectivity.LocalServer.Server = server;
};
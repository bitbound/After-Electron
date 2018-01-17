import * as net from "net";
import { UI, SocketData, Connectivity, Utilities, DataStore } from "./All";
import { ConnectionTypes, KnownServer, MessageCounter } from "../Models/All";
import { SendHelloFromServerToServer } from "./DataMessages/HelloFromServerToServer";
import { SendHelloFromClientToServer } from "./DataMessages/HelloFromClientToServer";
import { SendServerReachTest } from "./DataMessages/ServerReachTest";

export var ClientConnections: Array<net.Socket> = new Array<net.Socket>();

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
                Utilities.UpdateAndPrepend(DataStore.KnownServers, server, ["Host", "Port"]);
                if (connectionType == ConnectionTypes.ClientToServer) {
                    OutboundConnection.ConnectionType = connectionType;
                    OutboundConnection.Server = server;
                    OutboundConnection.Socket = socket;
                    SendHelloFromClientToServer(socket);
                }
                else if (connectionType == ConnectionTypes.ServerToServer) {
                    ServerToServerConnections.push(socket);
                    UI.RefreshConnectivityBar();
                    SendHelloFromServerToServer(server, socket);
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
                    if (!SocketData.CheckMessageCounter(socket)) {
                        return;
                    }
                    // Sometimes, multiple messages are received in the same event (at least on LAN).
                    // This ensures that the JSON objects are split and parsed separately.
                    var messages = SocketData.SplitJSONObjects(data.toString());

                    for (var i = 0; i < messages.length; i++) {
                        var jsonData = JSON.parse(messages[i]);
                        if (SocketData.HaveYouGotten(jsonData.ID)) {
                            UI.AddDebugMessage(`Already received from server (${socket.remoteAddress}): `, jsonData, 1);
                            continue;
                        }
                        UI.AddDebugMessage(`Received from server (${socket.remoteAddress}): `, jsonData, 1);
                        if (jsonData.TargetServerID != DataStore.ConnectionSettings.ServerID && jsonData.ShouldBroadcast != false) {
                            SocketData.Broadcast(jsonData);
                        }
                        SocketData["Receive" + jsonData.Type](jsonData, socket);
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
    for (var i = 0; i < DataStore.KnownServers.length; i++) {
        var server = DataStore.KnownServers[i];
        try {
            if (server.ID == DataStore.ConnectionSettings.ServerID) {
                appendServers.push(server);
                continue;
            }
            if (
                DataStore.BlockedServers.some((value) => {
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
        Utilities.UpdateAndAppend(DataStore.KnownServers, value, ["Host", "Port"]);
    })
    removeServers.forEach(value => {
        var index = DataStore.KnownServers.indexOf(value);
        DataStore.KnownServers.splice(index, 1);
    })
    if (OutboundConnection.IsConnected() == false) {
        UI.AddSystemMessage("Unable to find a client-to-server connection.  Try reconnecting later.", 1);
    }
    UI.RefreshConnectivityBar();
    for (var i = DataStore.KnownServers.length - 1; i >= 0; i--) {
        if (DataStore.KnownServers[i].BadConnectionAttempts > DataStore.ConnectionSettings.MaxConnectionAttempts) {
            DataStore.KnownServers.splice(i, 1);
        }
    }
}

export async function FindServerToServerConnection() {
    UI.AddSystemMessage("Attempting to find a server-to-server connection.", 1);
    var connected = false;
    var appendServers = [];
    var removeServers = [];
    for (var i = 0; i < DataStore.KnownServers.length; i++) {
        var server = DataStore.KnownServers[i];
        try {
            if (server.ID == DataStore.ConnectionSettings.ServerID) {
                continue;
            }
            if (
                DataStore.BlockedServers.some((value) => {
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
        Utilities.UpdateAndAppend(DataStore.KnownServers, value, ["Host", "Port"]);
    })
    removeServers.forEach(value => {
        var index = DataStore.KnownServers.indexOf(value);
        DataStore.KnownServers.splice(index, 1);
    })
    
    UI.RefreshConnectivityBar();
    for (var i = DataStore.KnownServers.length - 1; i >= 0; i--) {
        if (DataStore.KnownServers[i].BadConnectionAttempts > DataStore.ConnectionSettings.MaxConnectionAttempts) {
            DataStore.KnownServers.splice(i, 1);
        }
    }
    if (!connected) {
        UI.AddSystemMessage("Unable to find a server-to-server connection.  Try reconnecting later.", 1);
    }
    else {
        SendServerReachTest();
    }
}

export async function RefreshConnections(){
    if (DataStore.ConnectionSettings.IsServerEnabled && Connectivity.LocalServer.IsListening() == false) {
        await Connectivity.StartServer();
    }
    if (DataStore.ConnectionSettings.IsServerEnabled && ServerToServerConnections.length == 0 && DataStore.ConnectionSettings.IsNetworkSupport){
        await FindServerToServerConnection();
    }
    if (DataStore.ConnectionSettings.IsClientEnabled && !OutboundConnection.IsConnected()){
        await FindClientToServerConnection();
    }
}

export async function StartServer() {
    DataStore.ConnectionSettings.ServerID = DataStore.ConnectionSettings.ServerID || Utilities.CreateGUID();
    var server = net.createServer(function (socket) {
        // TODO: Needed?
        //if (Utilities.IsLocalIP(socket.remoteAddress) && socket.remotePort == Storage.ConnectionSettings.ServerListeningPort) {
        //    return;
        //}
        socket["id"] = Utilities.CreateGUID();
        socket.on("data", (data) => {
            try {
                if (!SocketData.CheckMessageCounter(socket)) {
                    return;
                }

                // Sometimes, multiple messages are received in the same event (at least on LAN).
                // This ensures that the JSON objects are split and parsed separately.
                var messages = SocketData.SplitJSONObjects(data.toString());

                for (var i = 0; i < messages.length; i++) {
                    var jsonData = JSON.parse(messages[i]);
                    if (SocketData.HaveYouGotten(jsonData.ID)) {
                        UI.AddDebugMessage(`Already received from client (${socket.remoteAddress}): `, jsonData, 1);
                        return;
                    }
                    UI.AddDebugMessage(`Received from client (${socket.remoteAddress}): `, jsonData, 1);
                    if (jsonData.TargetServerID != DataStore.ConnectionSettings.ServerID && jsonData.ShouldBroadcast != false) {
                        SocketData.Broadcast(jsonData);
                    }
                    SocketData["Receive" + jsonData.Type](jsonData, socket);
                }

            }
            catch (ex) {
                Utilities.Log(ex.stack);
            }
        });
        socket.on("error", (err: Error) => {
            Utilities.Log(err.stack);
            Utilities.RemoveFromArray(ClientConnections, value=>value["id"] == socket["id"]);
            Utilities.RemoveFromArray(ServerToServerConnections, value=>value["id"] == socket["id"]);
            UI.RefreshConnectivityBar();
        })
        socket.on("close", () => {
            Utilities.RemoveFromArray(ClientConnections, value=>value["id"] == socket["id"]);
            Utilities.RemoveFromArray(ServerToServerConnections, value=>value["id"] == socket["id"]);
            UI.RefreshConnectivityBar();
        })
    });
    server.on("close", function () {
        if (!Connectivity.LocalServer.IsShutdownExpected) {
            setTimeout(() => {
                server.close();
                server.listen(DataStore.ConnectionSettings.ServerListeningPort);
            }, 1000);
        }
    })
    server.on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
            UI.AddDebugMessage('TCP Server Error: Port already in use.', null, 1);
        }
        Utilities.Log(e.stack);
    });
    server.listen(DataStore.ConnectionSettings.ServerListeningPort, function () {
        UI.AddDebugMessage("TCP server started.", null, 1);
    });
    Connectivity.LocalServer.Server = server;
};
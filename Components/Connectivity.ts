import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as Connectivity from "./Connectivity";
import * as SocketDataIO from "./SocketDataIO";
import * as UI from "./UI";

export var OutboundConnection = new class OutboundConnection {
    TargetServerID: string;
    ConnectionType: Models.ConnectionTypes;
    IsDisconnectExpected: boolean = false;
    Socket: NodeJS.Socket;
    Server: Models.KnownServer;
    IsConnected():boolean{
        if (this.Socket == null || this.Socket.writable == false){
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
    ID: string = Utilities.CreateGUID();
    IsListening():boolean{
        if (this.Server != null && this.Server.listening){
            return true;
        }
        else {
            return false;
        }
    }
}

export async function ConnectToServer(server:Models.KnownServer, connectionType:Models.ConnectionTypes):Promise<boolean> {
        var promise = new Promise<boolean>(function(resolve, reject){
            try {
                var socket = net.connect(server.Port, server.Host, ()=>{
                    server.BadConnectionAttempts = 0;
                    Utilities.UpdateOrPrepend(Storage.KnownServers, server);
                    OutboundConnection.ConnectionType = connectionType;
                    OutboundConnection.Server = server;
                    if (connectionType == Models.ConnectionTypes.ClientToServer){
                        SocketDataIO.SendHelloFromClientToServer();
                    }
                    else if (connectionType == Models.ConnectionTypes.ServerToServer){
                        SocketDataIO.SendHelloFromServerToServer();
                    }
                    resolve(true);
                });
                socket.on("error", (err:Error)=>{
                    resolve(false);
                });
                socket.on("data", (data)=>{
                    try
                    {
                        var jsonData = JSON.parse(data.toString());
                        if (Storage.ClientSettings.IsDebugMode){
                            UI.AddSystemMessage("Received from server: " + JSON.stringify(jsonData), 1);
                        }
                        if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                            return;
                        }
                        SocketDataIO.Broadcast(jsonData);
                        eval("SocketDataIO.Receive" + jsonData.Type + "(jsonData, this)");
                    }
                    catch (ex) {
                        Utilities.Log(JSON.stringify(ex));
                    }
                });
                OutboundConnection.Socket = socket;
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
                if (Storage.ClientSettings.IsDebugMode){
                    UI.AddSystemMessage("Received from client: " + JSON.stringify(jsonData), 1);
                }
                if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                    return;
                }
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
            var index = Storage.Temp.InboundConnections.findIndex(x=>x.Socket == socket);
            Storage.Temp.InboundConnections.splice(index, 1);
            UI.RefreshUI();
        })
        socket.on("close", ()=>{
            var index = Storage.Temp.InboundConnections.findIndex(x=>x.Socket == socket);
            Storage.Temp.InboundConnections.splice(index, 1);
            UI.RefreshUI();
        })
        var client = new Models.TCPClient();
        client.Socket = socket;
        Storage.Temp.InboundConnections.push(client);
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
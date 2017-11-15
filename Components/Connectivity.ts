import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as Connectivity from "./Connectivity";
import * as SocketDataIO from "./SocketDataIO";

export var OutboundConnection: typeof Models.OutboundConnection.prototype = new Models.OutboundConnection();
export var Server: typeof Models.LocalTCPServer.prototype = new Models.LocalTCPServer();

export async function ConnectToServer(host:string, port: number, connectionType:Models.ConnectionTypes):Promise<boolean> {
        var promise = new Promise<boolean>(function(resolve, reject){
            try {
                var socket = net.connect(port, host, ()=>{
                    var connection = new Models.OutboundConnection();
                    connection.ConnectionType = connectionType;
                    connection.Socket = socket;
                    connection.Server = new Models.KnownTCPServer(host, port);
                    if (connectionType == Models.ConnectionTypes.ActiveClient){
                        OutboundConnection = connection;
                        SocketDataIO.SendHelloAsActiveClient();
                    }
                    else if (connectionType == Models.ConnectionTypes.PassiveClient) {
                        OutboundConnection = connection;
                        SocketDataIO.SendHelloAsPassiveClient();
                    }
                    else if (connectionType == Models.ConnectionTypes.ServerToServer){
                        // TODO
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
                        if (SocketDataIO.HaveYouGotten(jsonData.ID)){
                            return;
                        }
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
        console.log("Connection received.");
        socket.on("data", (data)=>{
            try
            {
                var jsonData = JSON.parse(data.toString());
                // TODO: Did I already get?
                // TODO: Send to peers.
                eval("SocketDataIO.Receive" + jsonData.Type + "(jsonData, this)");
            }
            catch (ex) {
                Utilities.Log(JSON.stringify(ex));
            }
        });
        socket.on("error", (err:Error)=>{
            Utilities.Log(JSON.stringify(err));
            setTimeout(() => {
                server.close();
                server.listen(Storage.ServerSettings.TCPServerPort);
            }, 1000);
        })
    });
    server.on("close", function(){
        if (!Connectivity.Server.IsShutdownExpected){
            setTimeout(() => {
                server.close();
                server.listen(Storage.ServerSettings.TCPServerPort);
            }, 1000);
        }
    })
    server.on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
            Utilities.Log('TCP Server: Address in use.  Retrying...');
            setTimeout(() => {
                server.close();
                server.listen(Storage.ServerSettings.TCPServerPort);
            }, 1000);
        }
    });
    server.listen(Storage.ServerSettings.TCPServerPort, function(){
        Utilities.Log("TCP server started.");
    });
    this.Server.TCPServer = server;
};
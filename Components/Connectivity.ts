import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as Connectivity from "./Connectivity";
import * as SocketDataHandlers from "./SocketDataHandlers";

export var TCP = new class TCP {
    OutSocket: typeof Models.OutboundConnection.prototype = new Models.OutboundConnection();
    Server: typeof Models.LocalTCPServer.prototype = new Models.LocalTCPServer();
    IsDisconnectExpect: boolean;

    async ConnectToServer(host:string, port: number, active:boolean):Promise<boolean> {
            var promise = new Promise<boolean>(function(resolve, reject){
                try {
                    var socket = net.connect(port, host, ()=>{
                        var connection = new Models.OutboundConnection();
                        connection.Socket = socket;
                        connection.Server = new Models.KnownTCPServer(host, port);
                        Connectivity.TCP.OutSocket = connection;
                        if (active){
                            SocketDataHandlers.SendHelloAsActiveClient();
                        }
                        else {
                            SocketDataHandlers.SendHelloAsPassiveClient();
                        }
                        resolve(true);
                    });
                    socket.on("data", (data)=>{
                        try
                        {
                            var jsonData = JSON.parse(data.toString());
                            if (Storage.Temp.HaveYouGotten(jsonData.ID)){
                                return;
                            }
                            eval("SocketDataHandlers.Receive" + jsonData.Type + "(jsonData, this)");
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
    StartServer() {
        var server = net.createServer(function(socket){
            console.log("Connection received.");
            socket.on("data", (data)=>{
                try
                {
                    var jsonData = JSON.parse(data.toString());
                    // TODO: Did I already get?
                    // TODO: Send to peers.
                    eval("SocketDataHandlers.Receive" + jsonData.Type + "(jsonData, this)");
                }
                catch (ex) {
                    Utilities.Log(JSON.stringify(ex));
                }
            });
            socket.on("error", (err:Error)=>{
                Utilities.Log(JSON.stringify(err));
                setTimeout(() => {
                    server.close();
                    server.listen(Storage.ClientSettings.TCPServerPort);
                }, 1000);
            })
        });
        server.on("close", function(){
            if (!Connectivity.TCP.Server.IsShutdownExpected){
                setTimeout(() => {
                    server.close();
                    server.listen(Storage.ClientSettings.TCPServerPort);
                }, 1000);
            }
        })
        server.on('error', (e: NodeJS.ErrnoException) => {
            if (e.code === 'EADDRINUSE') {
                Utilities.Log('TCP Server: Address in use.  Retrying...');
                setTimeout(() => {
                    server.close();
                    server.listen(Storage.ClientSettings.TCPServerPort);
                }, 1000);
            }
        });
        server.listen(Storage.ClientSettings.TCPServerPort, function(){
            Utilities.Log("TCP server started.");
        });
        this.Server.TCPServer = server;
    };
}

// Undecided if P2P will be used.
//class Peer2Peer {
//    RTCConnection: RTCPeerConnection;
//    RTCSendChannel: RTCRtpSender;
//    RTCReceiveChannel: RTCRtpReceiver;
//    InitRTCConnection(){
//        this.RTCConnection = new RTCPeerConnection({
//            optional: [{RtpDataChannels: true}],
//            iceServers: [
//                {
//                    //urls: Storage.STUNServers
//                }
//            ]
//        });
//        this.RTCConnection.onicecandidate = function (evt) {
//            if (evt.candidate) {
//                Connectivity.TCP.PassiveOutSocket.write(JSON.stringify({
//                    'Type': 'RTCCandidate',
//                    'Candidate': evt.candidate
//                }));
//            }
//        };
//        this.RTCConnection.ondatachannel = function(event) {
//            this.RTCReceiveChannel = event.channel;
//            this.RTCReceiveChannel.onmessage = function(event){
//                //console.log(event.data);
//            };
//        };
//        this.RTCConnection.createDataChannel
//    };
//    CreateOffer() {
//    };
//    FindSTUNServer() {
//    };
//    IsEnabled: boolean;
//
//};
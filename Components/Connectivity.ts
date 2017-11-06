import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as Connectivity from "./Connectivity";
import * as SocketDataHandlers from "./SocketDataHandlers";



export var TCP = new class TCP {
    OutSocket: typeof Models.OutboundConnection.prototype;
    Server: typeof net.Server.prototype;

    async ConnectToServer(host:string, port: number, active:boolean):Promise<boolean>{
        var socket = await net.connect(port, host, ()=>{
            var connection = new Models.OutboundConnection();
            connection.Socket = socket;
            connection.Server = new Models.KnownTCPServer(host, port);
            this.OutSocket = connection;
            if (active){
                SocketDataHandlers.SendHelloAsActiveClient();
            }
            else {
                SocketDataHandlers.SendHelloAsPassiveClient();
            }
        });
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
        return true;
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
            })
        });
        server.on("close", function(){
            // If not expected, reopen.
        })
        server.listen(Storage.ClientSettings.TCPServerPort, function(){
            Utilities.Log("TCP server started.");
        });
        server.on('error', (e: NodeJS.ErrnoException) => {
            if (e.code === 'EADDRINUSE') {
                Utilities.Log('TCP Server: Address in use.  Retrying...');
                setTimeout(() => {
                server.close();
                server.listen(Storage.ClientSettings.TCPServerPort);
                }, 1000);
            }
            });
    };
    IsServerEnabled: boolean;
    IsDisconnectExpect: boolean;
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
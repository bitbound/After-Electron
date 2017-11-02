import * as net from "net";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as Connectivity from "./Connectivity";

export var TCP = new class TCP {
    OutSocket1: typeof net.Socket.prototype;
    OutSocket2: typeof net.Socket.prototype;
    Server: typeof net.Server.prototype;

    StartServer() {
        var server = net.createServer(function(socket){
            console.log("Connection received.");
            var client = new Models.ActiveTCPClient();
            client.Socket = socket;
            // Handle socket.
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

// TODO: Undecided if P2P will be used.
class Peer2Peer {
    RTCConnection: RTCPeerConnection;
    RTCSendChannel: RTCRtpSender;
    RTCReceiveChannel: RTCRtpReceiver;
    InitRTCConnection(){
        this.RTCConnection = new RTCPeerConnection({
            //optional: [{RtpDataChannels: true}],
            iceServers: [
                {
                    //urls: Storage.STUNServers
                }
            ]
        });
        this.RTCConnection.onicecandidate = function (evt) {
            if (evt.candidate) {
                Connectivity.TCP.OutSocket1.write(JSON.stringify({
                    'Type': 'RTCCandidate',
                    'Candidate': evt.candidate
                }));
            }
        };
        //this.RTCConnection.ondatachannel = function(event) {
            //this.RTCReceiveChannel = event.channel;
            //this.RTCReceiveChannel.onmessage = function(event){
                //console.log(event.data);
            //};
        //};
        //this.RTCConnection.createDataChannel
    };
    CreateOffer() {
    };
    FindSTUNServer() {
    };
    IsEnabled: boolean;

};
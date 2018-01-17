import { Broadcast, SendToSpecificSocket } from "../SocketData";
import { Utilities, DataStore, UI, Connectivity } from "../All";
import * as net from "net";
import { ConnectionTypes } from "../../Models/All";


export function SendServerReachTest() {
    var testID = Utilities.CreateGUID();
    DataStore.Temp.OutgoingServerReachTestID = testID;
    SendToSpecificSocket({
        "Type": "ServerReachTest",
        "Stage": "Ping",
        "ID": Utilities.CreateGUID(),
        "TestID": testID
    }, Connectivity.ServerToServerConnections[0]);
}

export function ReceiveServerReachTest(jsonData: any, socket: net.Socket) {
    // This client is the original sender.
    if (jsonData.TestID == DataStore.Temp.OutgoingServerReachTestID) {
        if (jsonData.Stage == "Ping") {
            DataStore.KnownServers.forEach(element => {
                var tempSocket = net.connect(element.Port, element.Host, () => {
                    tempSocket["KnownServer"] = element;
                    SendToSpecificSocket({
                        "Type": "ServerReachTest",
                        "Stage": "Check",
                        "ID": Utilities.CreateGUID(),
                        "TestID": DataStore.Temp.OutgoingServerReachTestID,
                        "ShouldBroadcast": false
                    }, tempSocket);
                })
            });
        }
        else if (jsonData.Stage == "Result") {
            if (jsonData.Result == true) {
                UI.AddDebugMessage(`Server reach check OK on ${socket.remoteAddress}:${socket.remotePort}.`, null, 1);
                socket.end();
            }
            else if (jsonData.Result == false) {
                UI.AddDebugMessage(`Server reach check failed on ${socket.remoteAddress}:${socket.remotePort}.`, null, 1);
                Connectivity.ConnectToServer(socket["KnownServer"], ConnectionTypes.ServerToServer);
                Connectivity.ServerToServerConnections.push(socket);
            }
        }
    }
    // This client/server doesn't care about these tests.
    else if (!DataStore.ConnectionSettings.IsNetworkSupport || !DataStore.ConnectionSettings.IsServerEnabled) {
        return;
    }
    // This server will respond to tests.
    else {
        if (jsonData.Stage == "Ping") {
            DataStore.Temp.IncomingServerReachTests.push(jsonData.TestID);
        }
        else if (jsonData.Stage == "Check") {
            var index = DataStore.Temp.IncomingServerReachTests.findIndex(x => x == jsonData.TestID);
            if (index > -1) {
                DataStore.Temp.IncomingServerReachTests.splice(index, 1);
                SendToSpecificSocket({
                    "Type": "ServerReachTest",
                    "Stage": "Result",
                    "Result": true,
                    "ID": Utilities.CreateGUID(),
                    "ShouldBroadcast": false
                }, socket);
            }
            else {
                Connectivity.ServerToServerConnections.push(socket);
                SendToSpecificSocket({
                    "Type": "ServerReachTest",
                    "Stage": "Result",
                    "Result": false,
                    "ID": Utilities.CreateGUID(),
                    "ShouldBroadcast": false
                }, socket);
            }
        }
    }
}

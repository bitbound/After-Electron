import * as net from "net";
import { Connectivity, Storage, Utilities, UI } from "./All";
import { ConnectedClient, KnownServer, MessageCounter, ConnectionTypes } from "../Models/All";
import * as electron from "electron";
import { LocalServer } from "./Connectivity";

// Final Data Out //
export function Send(jsonData: any, socket: net.Socket) {
    UI.AddDebugMessage("Sending to " + socket.remoteAddress + ": " + JSON.stringify(jsonData), 1);
    // TODO: Remove GUID creation from individual functions.
    jsonData["ID"] = Utilities.CreateGUID();
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from Broadcast data: " + JSON.stringify(jsonData));
        return;
    }
    try {
        if (socket.writable) {
            socket.write(JSON.stringify(jsonData));
        }
    } catch (ex) { }
}



// Data Out Target Functions //
export function Broadcast(jsonData: any) {
    if (Connectivity.OutboundConnection.IsConnected()) {
        Send(jsonData, Connectivity.OutboundConnection.Socket);
    }
    Connectivity.ClientConnections.forEach(function (item) {
        Send(jsonData, item.Socket);
    })
    Connectivity.ServerToServerConnections.forEach(function (item) {
        Send(jsonData, item);
    })
    if (Connectivity.OutboundConnection.IsConnected() == false &&
        Connectivity.ClientConnections.length == 0 &&
        Connectivity.ServerToServerConnections.length == 0) {
        jsonData["ID"] = Utilities.CreateGUID();
        eval("Receive" + jsonData.Type + "(jsonData, new require('net').Socket())");
    }
}

export function SendToSpecificSocket(jsonData: any, socket: net.Socket) {
    Send(jsonData, socket);
}



// Socket Data In/Out Functions //
export function SendHelloFromClientToServer(socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromClientToServer",
        "ID": Utilities.CreateGUID(),
        "ServerID": Storage.ConnectionSettings.ServerID,
        "ShouldBroadcast": false,
        "ProcessID": electron.remote.app.getAppMetrics()[0].pid
    }, socket)
}
export function ReceiveHelloFromClientToServer(jsonData: any, socket: net.Socket) {
    var client = new ConnectedClient();
    client.Socket = socket;
    Connectivity.ClientConnections.push(client);
    $("#spanClientConnections").text(Connectivity.ClientConnections.length.toString());
    UI.AddDebugMessage(`Connection received from ${socket.remoteAddress}.`, 1);
    SendHelloFromServerToClient(socket);
    SendKnownServers(socket);
}
export function SendHelloFromServerToClient(socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToClient",
        "ID": Utilities.CreateGUID(),
        "ServerID": Storage.ConnectionSettings.ServerID,
        "ShouldBroadcast": false,
        "ProcessID": electron.remote.app.getAppMetrics()[0].pid
    }, socket)
}
export function ReceiveHelloFromServerToClient(jsonData: any, socket: net.Socket) {
    if (jsonData.ServerID == Storage.ConnectionSettings.ServerID && jsonData.ProcessID == electron.remote.app.getAppMetrics()[0].pid) {
        var server = Storage.KnownServers.find(x => x.Host == Connectivity.OutboundConnection.Server.Host
            && x.Port == Connectivity.OutboundConnection.Server.Port);
        server.ID == jsonData.ServerID;
        Utilities.UpdateAndAppend(Storage.KnownServers, server, ["Host", "Port"]);
        UI.AddSystemMessage("Client attempted to connect to self.  Your known servers have been reorganized.", 1);
        socket.end();
        return;
    }
    Connectivity.OutboundConnection.Server.ID = jsonData.ServerID;
    SendKnownServers(socket);
}
export function SendHelloFromServerToServer(toServer: KnownServer, socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToServer",
        "ID": Utilities.CreateGUID(),
        "ServerID": Storage.ConnectionSettings.ServerID,
        "KnownServer": toServer,
        "ShouldBroadcast": false,
        "ProcessID": electron.remote.app.getAppMetrics()[0].pid
    }, socket)
}
export function ReceiveHelloFromServerToServer(jsonData: any, socket: net.Socket) {
    if (jsonData.ServerID == Storage.ConnectionSettings.ServerID && jsonData.ProcessID == electron.remote.app.getAppMetrics()[0].pid) {
        var server = Storage.KnownServers.find(x => x.Host == jsonData.KnownServer.Host && x.Port == jsonData.KnownServer.Port);
        server.ID == jsonData.ServerID;
        Utilities.UpdateAndAppend(Storage.KnownServers, server, ["Host", "Port"]);
        UI.AddSystemMessage("Server attempted to connect to self.  Your known servers have been reorganized.", 1);
        socket.end();
        return;
    }
    Connectivity.ServerToServerConnections.push(socket);
    $("#spanServerConnections").text(Connectivity.ServerToServerConnections.length.toString());
    UI.AddDebugMessage(`Server connection received from ${socket.remoteAddress}.`, 1);
    SendKnownServers(socket);
}

export function SendKnownServers(socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "KnownServers",
        "ID": Utilities.CreateGUID(),
        "KnownServers": Storage.KnownServers.filter(server => server.IsLocalNetwork != true)
    }, socket)
}
export function ReceiveKnownServers(jsonData: any, socket: net.Socket) {
    for (var i = 0; i < jsonData.KnownServers.length; i++) {
        var server = jsonData.KnownServers[i];
        if (
            Storage.BlockedServers.some((value) => {
                return value.Host == server.Host && value.Port == server.Port;
            })
        ) {
            continue;
        }
        Utilities.AppendIfMissing(Storage.KnownServers, jsonData.KnownServers[i], ["Host", "Port"]);
    }
}
export function SendChat(message: string, channel: string) {
    Broadcast({
        "Type": "Chat",
        "ID": Utilities.CreateGUID(),
        "From": Storage.Me.Name,
        "Channel": channel,
        "Message": message
    });
}

export function ReceiveChat(jsonData: any, socket: net.Socket) {
    if (Storage.ConnectionSettings.IsClientEnabled) {
        switch (jsonData.Channel) {
            case "GlobalChat":
                UI.AddMessageHTML(`<span style='color:` +
                    Storage.ApplicationSettings.Colors.GlobalChat + `'>(Global) ` +
                    Utilities.EncodeForHTML(jsonData.From) + `: </span>` +
                    Utilities.EncodeForHTML(jsonData.Message), 1);
                break;

            default:
                break;
        }
    }
}

export function SendServerReachTest() {
    var testID = Utilities.CreateGUID();
    Storage.Temp.OutgoingServerReachTestID = testID;
    Send({
        "Type": "ServerReachTest",
        "Stage": "Ping",
        "TestID": testID
    }, Connectivity.ServerToServerConnections[0]);
}

export function ReceiveServerReachTest(jsonData: any, socket: net.Socket) {
    // This client is the original sender.
    if (jsonData.ID == Storage.Temp.OutgoingServerReachTestID) {
        if (jsonData.Stage == "Ping") {
            Storage.KnownServers.forEach(async element => {
                if (await Connectivity.ConnectToServer(element, ConnectionTypes.ServerToServer)) {
                    Send({
                        "Type": "ServerReachTest",
                        "Stage": "Check",
                        "TestID": Storage.Temp.OutgoingServerReachTestID
                    }, Connectivity.ServerToServerConnections[Connectivity.ServerToServerConnections.length - 1]);
                }
            });
        }
        else if (jsonData.Stoage == "Result") {
            if (jsonData.Result == true) {
                UI.AddDebugMessage(`Server reach check OK on ${socket.remoteAddress}:${socket.remotePort}.`, 1);
                socket.end();
            }
            else if (jsonData.Result == false) {
                UI.AddDebugMessage(`Server reach check failed on ${socket.remoteAddress}:${socket.remotePort}.`, 1);
                Connectivity.ServerToServerConnections.push(socket);
            }
        }
    }
    // This client/server doesn't care about these tests.
    else if (!Storage.ConnectionSettings.IsNetworkSupport || !Storage.ConnectionSettings.IsServerEnabled) {
        return;
    }
    // This server will respond to tests.
    else {
        if (jsonData.Stage == "Ping") {
            Storage.Temp.IncomingServerReachTests.push(jsonData.TestID);
        }
        else if (jsonData.Stage == "Check") {
            var index = Storage.Temp.IncomingServerReachTests.findIndex(x => x == jsonData.TestID);
            if (index > -1) {
                Storage.Temp.IncomingServerReachTests.splice(index, 1);
                Send({
                    "Type": "ServerReachTest",
                    "Stage": "Result",
                    "Result": true
                }, socket);
            }
            else {
                Connectivity.ServerToServerConnections.push(socket);
                Send({
                    "Type": "ServerReachTest",
                    "Stage": "Result",
                    "Result": false
                }, socket);
            }
        }
    }
}

// Utilities //

// Check if specific message has been received.
export function HaveYouGotten(id: string) {
    if (Storage.Temp.ReceivedMessages.find(item => item == id)) {
        return true;
    }
    else {
        Storage.Temp.ReceivedMessages.push(id);
        return false;
    }
}

export function CheckMessageCounter(socket: net.Socket): boolean {
    if (!Storage.Temp.MessageCounters.some(mc => mc.RemoteHost == socket.remoteAddress)) {
        var counter = new MessageCounter();
        counter.RemoteHost = socket.remoteAddress;
        counter.MessageTimes.push(Date.now());
        Storage.Temp.MessageCounters.push(counter);
    }
    var messageCounter = Storage.Temp.MessageCounters.find(x => x.RemoteHost == socket.remoteAddress);
    while (Date.now() - messageCounter.MessageTimes[0] > Storage.ConnectionSettings.MessageCountMilliseconds) {
        messageCounter.MessageTimes.splice(0, 1);
    }
    messageCounter.MessageTimes.push(Date.now());
    if (messageCounter.MessageTimes.length > Storage.ConnectionSettings.MessageCountLimit) {
        UI.AddDebugMessage(`Message limit exceeded from ${socket.remoteAddress}.`, 1);
        // Extend message times out by 5 minutes to prevent further messages from IP address.
        messageCounter.MessageTimes.forEach((value, index) => {
            messageCounter.MessageTimes[index] += 300000;
        })
        socket.end();
        return false;
    }
    return true;
}

// Sometimes, multiple messages are received in the same event (at least on LAN).
// This ensures that the JSON objects are split and parsed separately.
export function SplitJSONObjects(stringData: string): string[] {
    var messages = [];
    while (stringData.indexOf("}{") > -1) {
        var message = stringData.substring(0, stringData.indexOf("}{") + 1);
        messages.push(message);
        stringData = stringData.substring(stringData.indexOf("}{") + 1);
    }
    messages.push(stringData);
    return messages;
}
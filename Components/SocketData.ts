import * as net from "net";
import { Connectivity, DataStore, Utilities, UI } from "./All";
import { KnownServer, MessageCounter, ConnectionTypes, SocketConnection } from "../Models/All";
import * as electron from "electron";
import { LocalServer } from "./Connectivity";
import * as SocketMessages from "./SocketMessages/All";

// Final Data Out //
function Send(jsonData: any, socket: SocketConnection) {
    UI.AddDebugMessage(`Sending to ${(socket != null ? socket.remoteAddress : "mock socket")}: `, jsonData, 1);
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from Broadcast data: " + JSON.stringify(jsonData));
        throw "Type or ID missing from Broadcast data: " + JSON.stringify(jsonData);
    }
    if (socket.IsMock){
        SocketMessages[`Receive${jsonData.Type}`](jsonData, SocketConnection.GetMock());
    }
    else if (socket.writable) {
        socket.write(JSON.stringify(jsonData));
    }
}


// Data Out Target Functions //
export function Broadcast(jsonData: any) {
    if (Connectivity.OutboundConnection.IsConnected()) {
        Send(jsonData, Connectivity.OutboundConnection.Socket);
    }
    Connectivity.ClientConnections.forEach(function (item) {
        Send(jsonData, item);
    })
    Connectivity.ServerToServerConnections.forEach(function (item) {
        Send(jsonData, item);
    })
    if (Connectivity.OutboundConnection.IsConnected() == false &&
        Connectivity.ClientConnections.length == 0 &&
        Connectivity.ServerToServerConnections.length == 0) {
        jsonData["ID"] = Utilities.CreateGUID();
        SocketMessages[`Receive${jsonData.Type}`](jsonData, SocketConnection.GetMock());
    }
}

export function SendToSpecificSocket(jsonData: any, socket: SocketConnection) {
    Send(jsonData, socket);
}

export function SendToTargetServer(jsonData: any) {
    if (jsonData.TargetServerID == undefined) {
        Utilities.Log("TargetServerID missing from SendToTargetServer data: " + JSON.stringify(jsonData));
        throw "TargetServerID missing from SendToTargetServer data: " + JSON.stringify(jsonData);
    }
    if (Connectivity.OutboundConnection.TargetServerID == DataStore.ConnectionSettings.ServerID) {
        jsonData["ID"] = Utilities.CreateGUID();
        SocketMessages[`Receive${jsonData.Type}`](jsonData, SocketConnection.GetMock());
    }
    else if (Connectivity.OutboundConnection.IsConnected()) {
        Send(jsonData, Connectivity.OutboundConnection.Socket);
    }
    else {
        throw "Unable to determine resolve target server.";
    }
}

// Utilities //

// Check if specific message has been received.
export function HaveYouGotten(id: string) {
    if (DataStore.Temp.ReceivedMessages.find(item => item == id)) {
        return true;
    }
    else {
        DataStore.Temp.ReceivedMessages.push(id);
        return false;
    }
}

export function CheckMessageCounter(socket: net.Socket): boolean {
    if (!DataStore.Temp.MessageCounters.some(mc => mc.RemoteHost == socket.remoteAddress)) {
        var counter = new MessageCounter();
        counter.RemoteHost = socket.remoteAddress;
        counter.MessageTimes.push(Date.now());
        DataStore.Temp.MessageCounters.push(counter);
    }
    var messageCounter = DataStore.Temp.MessageCounters.find(x => x.RemoteHost == socket.remoteAddress);
    while (Date.now() - messageCounter.MessageTimes[0] > DataStore.ConnectionSettings.MessageCountMilliseconds) {
        messageCounter.MessageTimes.splice(0, 1);
    }
    messageCounter.MessageTimes.push(Date.now());
    if (messageCounter.MessageTimes.length > DataStore.ConnectionSettings.MessageCountLimit) {
        UI.AddDebugMessage(`Message limit exceeded from ${socket.remoteAddress}.`, null, 1);
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
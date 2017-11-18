import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as UI from "./UI";
import * as net from "net";
import { ConnectedClient } from "./Models/ConnectedClient";
import { KnownServer } from "./Models/index";

// Check if specific message has been received.
export function HaveYouGotten(id:string){
    if (Storage.Temp.ReceivedMessages.find(item=>item == id)){
        return true;
    }
    else {
        Storage.Temp.ReceivedMessages.push(id);
        return false;
    }
}


// Final Data Out //
export function Send(jsonData:any, socket: net.Socket){
    Utilities.WriteDebug("Sending to " + socket.remoteAddress + ": " + JSON.stringify(jsonData), 1);
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
        Connectivity.ClientConnections.length == 0)
        {
            eval("Receive" + jsonData.Type + "(jsonData, null)");
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
        "KnownServers": Storage.KnownServers,
        "ServerID": Connectivity.LocalServer.ID,
        "DoBroadcast": false
    }, socket)
}
export function ReceiveHelloFromClientToServer(jsonData: any, socket: net.Socket) {
    if (jsonData.ServerID == Connectivity.LocalServer.ID){
        return;
    }
    SendHelloFromServerToClient(socket);
    var client = new ConnectedClient();
    client.Socket = socket;
    Connectivity.ClientConnections.push(client);
    UI.RefreshUI();
    Utilities.Log(`Connection received from ${socket.remoteAddress}.`);
    SendKnownServers(socket);
}
export function SendHelloFromServerToClient(socket:net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToClient",
        "ID": Utilities.CreateGUID(),
        "KnownServers": Storage.KnownServers,
        "ServerID": Connectivity.LocalServer.ID,
        "DoBroadcast": false
    }, socket)
}
export function ReceiveHelloFromServerToClient(jsonData: any, socket: net.Socket) {
    var index = Storage.KnownServers.findIndex(x=>
        x.Host == Connectivity.OutboundConnection.Server.Host &&
        x.Port == Connectivity.OutboundConnection.Server.Port
    );
    if (jsonData.ServerID == Connectivity.LocalServer.ID){
        if (index > -1){
            var server = Storage.KnownServers.splice(index, 1);
            Storage.KnownServers.push(server[0]);
        }
        socket.end();
        UI.AddSystemMessage("Client has connected to self and was disconnected.  Please try restarting or connecting to another server manually.", 1);
        return;
    }
    Storage.KnownServers[index].ID = jsonData.ServerID;
    SendKnownServers(socket);
}
export function SendHelloFromServerToServer(toServer:KnownServer, socket:net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToServer",
        "ID": Utilities.CreateGUID(),
        "KnownServers": Storage.KnownServers,
        "ServerID": Connectivity.LocalServer.ID,
        "KnownServer": toServer,
        "DoBroadcast": false
    }, socket)
}
export function ReceiveHelloFromServerToServer(jsonData: any, socket: net.Socket) {
    if (jsonData.ServerID == Connectivity.LocalServer.ID){
        var index = Storage.KnownServers.findIndex(x=>
            x.Host == jsonData.KnownServer.Host &&
            x.Port == jsonData.KnownServer.Post
        );
        if (index > -1){
            var server = Storage.KnownServers.splice(index, 1);
            server[0].ID = jsonData.ServerID;
            Storage.KnownServers.push(server[0]);
        }
        socket.end();
        UI.AddSystemMessage("Client has connected to self and was disconnected.  Please try restarting or connecting to another server manually.", 1);
        return;
    }
    Connectivity.ServerToServerConnections.push(socket);
    UI.RefreshUI();
    Utilities.Log(`Server connection received from ${socket.remoteAddress}.`);
    SendKnownServers(socket);
}
export function ReceiveHelloToSelf(jsonData:any, socket: net.Socket){
    UI.AddSystemMessage("Client attempted to connect to self.  Please restart the game or reconnect manually.", 1);
    socket.end();
}
export function SendHelloToSelf(socket:net.Socket){
    SendToSpecificSocket({
        "Type": "HelloToSelf",
        "ID": Utilities.CreateGUID()
    }, socket)
}
export function SendKnownServers(socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToServer",
        "ID": Utilities.CreateGUID(),
        "KnownServers": Storage.KnownServers
    }, socket)
}
export function ReceiveKnownServers(jsonData: any, socket: net.Socket) {
    for (var i = 0; i < jsonData.KnownServers.length; i++){
        Utilities.UpdateAndAppend(Storage.KnownServers, jsonData.KnownServers[i], ["Host", "Port"]);
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
    switch (jsonData.Channel) {
        case "GlobalChat":
            UI.AddMessageHTML(`<span style='color:` +
                Storage.ClientSettings.Colors.GlobalChat + `'>(Global) ` +
                Utilities.EncodeForHTML(jsonData.From) + `: </span>` +
                Utilities.EncodeForHTML(jsonData.Message), 1);
            break;

        default:
            break;
    }
}
import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as UI from "./UI";
import { ConnectedClient } from "./Models/ConnectedClient";

// Final Data Out //
export function Send(jsonData:any, socket: NodeJS.Socket){
    Utilities.WriteDebug("Sending: " + JSON.stringify(jsonData), 1);
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
    Connectivity.InboundConnections.forEach(function (item) {
        Send(jsonData, item.Socket);
    })
    if (Connectivity.OutboundConnection.IsConnected() == false && 
        Connectivity.InboundConnections.length == 0)
        {
            eval("Receive" + jsonData.Type + "(jsonData, null)");
        }
}

export function SendToTargetServer(jsonData: any) {
    if (Connectivity.LocalServer.ID == Connectivity.OutboundConnection.TargetServerID || Connectivity.OutboundConnection.IsConnected() == false) {
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
    else {
        Send(jsonData, Connectivity.OutboundConnection.Socket);
    }
}

export function SendToSpecificClient(jsonData: any, client:ConnectedClient) {
    Send(jsonData, client.Socket);
}

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

// Socket Data In/Out Functions //
export function SendHelloFromClientToServer() {
    Broadcast({
        "Type": "HelloFromClientToServer",
        "KnownServers": Storage.KnownServers,
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveHelloFromClientToServer(jsonData: any, socket: NodeJS.Socket) {
    for (var i = 0; i < jsonData.KnownServers.length; i++){
        Utilities.UpdateAndAppend(Storage.KnownServers, jsonData.KnownServers[i],  ["IP", "Port"]);
    }
}
export function SendHelloFromServerToClient() {
    Broadcast({
        "Type": "HelloFromServerToClient",
        "KnownServers": Storage.KnownServers,
        "ID": Utilities.CreateGUID(),
        "ServerID": Connectivity.LocalServer.ID
    })
}
export function ReceiveHelloFromServerToClient(jsonData: any, socket: NodeJS.Socket) {
    if (jsonData.ServerID == Connectivity.LocalServer.ID){
        var index = Storage.KnownServers.findIndex(x=>
            x.Host == Connectivity.OutboundConnection.Server.Host &&
            x.Port == Connectivity.OutboundConnection.Server.Port
        );
        var server = Storage.KnownServers.splice(index, 1);
        Storage.KnownServers.push(server[0]);
        socket.end();
        Connectivity.FindServer();
        return;
    }
    for (var i = 0; i < jsonData.KnownServers.length; i++){
        Utilities.UpdateAndAppend(Storage.KnownServers, jsonData.KnownServers[i], ["IP", "Port"]);
    }
}
export function SendHelloFromServerToServer() {
    Broadcast({
        "Type": "HelloFromServerToClient",
        "KnownServers": Storage.KnownServers,
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveHelloFromServerToServer(jsonData: any, socket: NodeJS.Socket) {
    
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

export function ReceiveChat(jsonData: any, socket: NodeJS.Socket) {
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
import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as UI from "./UI";

// Final Data Out //
export function Send(jsonData:any, socket: NodeJS.Socket){
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
    Storage.Temp.InboundConnections.forEach(function (item) {
        Send(jsonData, item.Socket);
    })
}

export function SendToTargetServer(jsonData: any) {
    if (Connectivity.LocalServer.ID == Connectivity.OutboundConnection.TargetServerID || Connectivity.OutboundConnection.IsConnected() == false) {
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
    else {
        Send(jsonData, Connectivity.OutboundConnection.Socket);
    }
}

export function SendToSpecificClient(jsonData: any, playerID:string) {
    var client = Storage.Temp.ActiveTCPClientConnections.find((value)=>{
        return value.ID == playerID;
    })
    if (client == undefined){
        throw "PlayerID not found.";
    }
    else {
        Send(jsonData, client.Socket);
    }
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
export function SendHelloFromServerToClient() {
 
}
export function ReceiveHelloFromServerToClient(jsonData: any, socket: NodeJS.Socket) {
    
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
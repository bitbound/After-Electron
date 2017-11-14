import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as UI from "./UI";

// Final Data Out //

// Data Out Target Functions //
export function Broadcast(jsonData: any) {
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from Broadcast data: " + JSON.stringify(jsonData));
        return;
    }
    if (Connectivity.OutboundConnection.IsConnected()) {
        Connectivity.OutboundConnection.Socket.write(JSON.stringify(jsonData));
    }
    Storage.Temp.ActiveTCPClientConnections.forEach(function (item) {
        try {
            if (item.Socket.writable) {
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) { }
    });
    Storage.Temp.PassiveTCPClientConnections.forEach(function (item) {
        try {
            if (item.Socket.writable) {
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) { }
    })
}

export function SendToPassiveServer(jsonData: any) {
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from SendToPassiveServer data: " + JSON.stringify(jsonData));
        return;
    }
    if (Connectivity.OutboundConnection.IsConnected()) {
        Connectivity.OutboundConnection.Socket.write(JSON.stringify(jsonData));
    }
    else {
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
}
export function SendToActiveServer(jsonData: any) {
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from SendToActiveServer data: " + JSON.stringify(jsonData));
        return;
    }
    if (Connectivity.Server.ID == Connectivity.OutboundConnection.ActiveServerID || Connectivity.OutboundConnection.IsConnected() == false) {
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
    else {
        Connectivity.OutboundConnection.Socket.write(JSON.stringify(jsonData));
    }
}
export function SendToActiveClients(jsonData: any) {
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from SendToActiveClients data: " + JSON.stringify(jsonData));
        return;
    }
    Storage.Temp.ActiveTCPClientConnections.forEach(function (item) {
        try {
            if (item.Socket.writable) {
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) { }
    });
}
export function SendToPassiveClients(jsonData: any) {
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from SendToPassiveClients data: " + JSON.stringify(jsonData));
        return;
    }
    Storage.Temp.PassiveTCPClientConnections.forEach(function (item) {
        try {
            if (item.Socket.writable) {
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) { }
    });
}
export function SendToSpecificClient(jsonData: any, playerID:string) {
    if (jsonData.Type == undefined || jsonData.ID == undefined) {
        Utilities.Log("Type or ID missing from SendToSpecificClient data: " + JSON.stringify(jsonData));
        return;
    }
    var client = Storage.Temp.ActiveTCPClientConnections.find((value)=>{
        return value.ID == playerID;
    })
    if (client == undefined){
        throw "PlayerID not found.";
    }
    else {
        try {
            if (client.Socket.writable){
                client.Socket.write(JSON.stringify(jsonData));
            }
        }
        catch (ex){}
    }
}


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
export function SendHelloAsActiveClient() {
    SendToActiveServer({
        "Type": "HelloAsActiveClient",
        "ID": Utilities.CreateGUID()
    });
}
export function ReceiveHelloAsActiveClient(jsonData: any, socket: NodeJS.Socket) {
    var client = new Models.ActiveTCPClient();
    client.ID = jsonData.ID;
    client.Socket = socket;
    Storage.Temp.ActiveTCPClientConnections.push(client);
}
export function SendHelloAsPassiveClient() {
    SendToActiveServer({
        "Type": "HelloAsPassiveClient",
        "ID": Utilities.CreateGUID()
    });
}
export function ReceiveHelloAsPassiveClient(jsonData: any, socket: NodeJS.Socket) {
    var client = new Models.PassiveTCPClient();
    client.ID = Utilities.CreateGUID();
    client.Socket = socket;
    Storage.Temp.PassiveTCPClientConnections.push(client);
}
export function SendChat(message: string, channel: string) {
    SendToPassiveServer({
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
            Broadcast(jsonData);
            break;

        default:
            break;
    }
}
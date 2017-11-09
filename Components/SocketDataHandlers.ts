import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as UI from "./UI";

// Final Data Out Functions //
export function Broadcast(jsonData:any){
    if (jsonData.Type == undefined || jsonData.ID == undefined){
        Utilities.Log("Type or ID missing from Broadcast data: " + JSON.stringify(jsonData));
        return;
    }
    if (Connectivity.TCP.OutSocket.IsConnected()){
        Connectivity.TCP.OutSocket.Socket.write(JSON.stringify(jsonData));
    }
    Storage.Temp.ActiveTCPClientConnections.forEach(function(item){
        try {
            if (item.Socket.writable){
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) {}
    });
    Storage.Temp.PassiveTCPClientConnections.forEach(function(item){
        try {
            if (item.Socket.writable){
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) {}
    })
}

export function SendToPassiveServer(jsonData:any){
    if (jsonData.Type == undefined || jsonData.ID == undefined){
        Utilities.Log("Type or ID missing from SendToPassiveServer data: " + JSON.stringify(jsonData));
        return;
    }
    if (Connectivity.TCP.OutSocket.IsConnected()){
        Connectivity.TCP.OutSocket.Socket.write(JSON.stringify(jsonData));
    }
    else {
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
}
export function SendToActiveServer(jsonData:any){
    if (jsonData.Type == undefined || jsonData.ID == undefined){
        Utilities.Log("Type or ID missing from SendToActiveServer data: " + JSON.stringify(jsonData));
        return;
    }
    if (Connectivity.TCP.Server.ID == Connectivity.TCP.OutSocket.ActiveServerID || Connectivity.TCP.OutSocket.IsConnected() == false){
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
    else {
        Connectivity.TCP.OutSocket.Socket.write(JSON.stringify(jsonData));
    }
}
export function SendToActiveClients(jsonData:any){
    Storage.Temp.ActiveTCPClientConnections.forEach(function(item){
        try {
            if (item.Socket.writable){
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) {}
    });
}
export function SendToPassiveClients(jsonData:any){
    Storage.Temp.PassiveTCPClientConnections.forEach(function(item){
        try {
            if (item.Socket.writable){
                item.Socket.write(JSON.stringify(jsonData));
            }
        } catch (ex) {}
    });
}



// Socket Data In/Out Functions //
export function SendHelloAsActiveClient(){
    SendToActiveServer({
        "Type": "HelloAsActiveClient",
        "ID": Utilities.CreateGUID()
    });
}
export function ReceiveHelloAsActiveClient(jsonData:any, socket: NodeJS.Socket){
    var client = new Models.ActiveTCPClient();
    client.ID = jsonData.ID;
    client.Socket = socket;
    Storage.Temp.ActiveTCPClientConnections.push(client);
}
export function SendHelloAsPassiveClient(){
    SendToActiveServer({
        "Type": "HelloAsPassiveClient",
        "ID": Utilities.CreateGUID()
    });
}
export function ReceiveHelloAsPassiveClient(jsonData:any, socket:NodeJS.Socket){
    var client = new Models.PassiveTCPClient();
    client.ID = Utilities.CreateGUID();
    client.Socket = socket;
    Storage.Temp.PassiveTCPClientConnections.push(client);
}
export function SendChat(message:string, channel: string){
    SendToPassiveServer({
        "Type": "Chat",
        "ID": Utilities.CreateGUID(),
        "From": Storage.Me.Name,
        "Channel": channel,
        "Message": message
    });
}

export function ReceiveChat(jsonData:any, socket:NodeJS.Socket){
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
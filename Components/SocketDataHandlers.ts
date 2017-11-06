import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";
import * as UI from "./UI";

export function Send(jsonData:any, canUsePassiveConnection:boolean){
    if (Connectivity.TCP.OutSocket.IsConnected()){
        // TODO: Add target server to jsonData: Connectivity.TCP.OutSocket.Server.IP/Port.
        Connectivity.TCP.OutSocket.Socket.write(JSON.stringify(jsonData));
    }
    else {
        eval("Receive" + jsonData.Type + "(jsonData)");
    }
}

export function SendHelloAsActiveClient(){
    Send({
        "Type": "HelloAsActiveClient",
        "ID": Utilities.CreateGUID()
    }, false);
}
export function ReceiveHelloAsActiveClient(jsonData:any){

}
export function SendHelloAsPassiveClient(){
    Send({
        "Type": "HelloAsPassiveClient",
        "ID": Utilities.CreateGUID()
    }, true);
}
export function ReceiveHelloAsPassiveClient(jsonData:any, socket:NodeJS.Socket){
    var client = new Models.PassiveTCPClient();
    client.ID = Utilities.CreateGUID();
    client.Socket = socket;
    Storage.Temp.PassiveTCPClientConnections.push(client);
}
export function SendChat(message:string, channel: string){
    Send({
        "Type": "Chat",
        "ID": Utilities.CreateGUID(),
        "From": Storage.Me.Name,
        "Channel": channel,
        "Message": message
    }, true);
}

export function ReceiveChat(jsonData:any, socket:NodeJS.Socket){
    switch (jsonData.Channel) {
        case "GlobalChat":
            UI.AddMessageHTML(`<span style='color:` +
                Storage.ClientSettings.Colors.GlobalChat + `'>(Global Chat) ` +
                Utilities.EncodeForHTML(jsonData.From) + `: </span>` +
                Utilities.EncodeForHTML(jsonData.Message), 1);
            break;
    
        default:
            break;
    }
}
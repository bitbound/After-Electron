import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";
import * as Models from "./Models";

export var OutSocket:NodeJS.Socket|typeof Connectivity.MockSocket = Connectivity.MockSocket;

export function SetOutSocket(socket:NodeJS.Socket){
    OutSocket = socket;
}

export function SendHelloAsActiveClient(){
    OutSocket.write(JSON.stringify({
        "Type": "HelloAsActiveClient",
        "ID": Utilities.CreateGUID()
    }));
}
export function ReceiveHelloAsActiveClient(jsonData:any, socket:NodeJS.Socket){

}
export function SendHelloAsPassiveClient(){
    OutSocket.write(JSON.stringify({
        "Type": "HelloAsPassiveClient",
        "ID": Utilities.CreateGUID()
    }));
}
export function ReceiveHelloAsPassiveClient(jsonData:any, socket:NodeJS.Socket){
    var client = new Models.PassiveTCPClient();
    client.ID = Utilities.CreateGUID();
    client.Socket = socket;
    Storage.Temp.PassiveTCPClientConnections.push(client);
}
export function SendChat(message:string, channel: string){
    OutSocket.write(JSON.stringify({
        "Type": "Chat",
        "ID": Utilities.CreateGUID(),
        "Channel": channel,
        "Message": message
    }));
}

export function ReceiveChat(jsonData:any, socket:NodeJS.Socket){

}
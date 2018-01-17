import { SendToTargetServer } from "../SocketData";
import { Utilities } from "../All";
import * as net from "net";

export function SendLook(){
    SendToTargetServer({
        "Type": "Look",
        "Stage": "Request",
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveLook(jsonData:any, socket:net.Socket) {

}
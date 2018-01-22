import { SendToTargetServer } from "../SocketData";
import { Utilities } from "../All";
import * as net from "net";

export function SendChargeToggle() {
    SendToTargetServer({
        "Type": "ChargeToggle",
        "Stage": "Request",
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveChargeToggle(jsonData:any, socket:net.Socket) {

}
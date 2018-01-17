import { SendToTargetServer } from "../SocketData";
import { Utilities } from "../All";
import * as net from "net";

export function SendChargeToggle() {
    // TODO: Use CommandRequests and verify on receipt.
    SendToTargetServer({
        "Type": "ChargeToggle",
        "Stage": "Request",
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveChargeToggle(jsonData:any, socket:net.Socket) {

}
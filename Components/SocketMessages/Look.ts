import { SendToTargetServer, SendToSpecificSocket } from "../SocketData";
import { Utilities, DataStore, Connectivity, SessionManager } from "../All";
import * as net from "net";
import { Void, SocketConnection } from "../../Models/All";

export function SendLook(){
    SendToTargetServer({
        "Type": "Look",
        "Stage": "Request",
        "TargetServerID": Connectivity.OutboundConnection.TargetServerID,
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveLook(jsonData:any, socket: SocketConnection) {
    switch (jsonData.Stage) {
        case "Request":
            if (jsonData.TargetServerID != DataStore.ConnectionSettings.ServerID)
            {
                return;
            }
            var currentVoid = SessionManager.FindVoidByPlayerID(socket.PlayerID);
            SendToSpecificSocket({
                "Type": "Look",
                "Stage": "Result",
                "ID": Utilities.CreateGUID(),
                "Void": currentVoid
            }, socket);
            break;
        case "Result":
            (jsonData.Void as Void).Display();
        break;
        default:
            break;
    }
}
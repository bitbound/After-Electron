import { SendToTargetServer, SendToSpecificSocket } from "../SocketData";
import { Utilities, SessionManager, DataStore, UI, Connectivity } from "../All";
import * as net from "net";
import { SocketConnection, Void, ReadyStates } from "../../Models/All";

export function SendChargeToggle() {
    SendToTargetServer({
        "Type": "ChargeToggle",
        "Stage": "Request",
        "TargetServerID": Connectivity.OutboundConnection.TargetServerID,
        "ID": Utilities.CreateGUID()
    })
}
export function ReceiveChargeToggle(jsonData:any, socket: SocketConnection) {
    switch (jsonData.Stage) {
        case "Request":
            if (jsonData.TargetServerID != DataStore.ConnectionSettings.ServerID)
            {
                return;
            }
            var player = SessionManager.FindPlayerByID(socket.PlayerID);
            if (player.ReadyState == ReadyStates.OK){
                player.ReadyState = ReadyStates.Charging;
            }
            else if (player.ReadyState == ReadyStates.Charging){
                player.ReadyState = ReadyStates.OK;
            }
            SendToSpecificSocket({
                "Type": "ChargeToggle",
                "Stage": "Result",
                "Result": "ok",
                "ReadyState": player.ReadyState,
                "ID": Utilities.CreateGUID()
            }, socket);
            break;
        case "Result":
            if (jsonData.Result == "ok"){
                DataStore.Me.ReadyState = jsonData.ReadyState;
                if (DataStore.Me.ReadyState == 0){
                    UI.ChargingAnimationStop();
                }
                else {
                    UI.ChargingAnimationStart();
                }
            }
        break;
        default:
            break;
    }
}
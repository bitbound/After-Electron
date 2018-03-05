import { SendToTargetServer, SendToSpecificSocket } from "../SocketData";
import { Utilities, SessionManager, DataStore, UI, Connectivity } from "../All";
import * as net from "net";
import { SocketConnection, Void, ReadyStates } from "../../Models/All";
import { SendStatUpdate } from "./StatUpdate";

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

            var chargeIncreaseInterval = window.setInterval(()=>{
                if (player.ReadyState != ReadyStates.Charging){
                    window.clearInterval(chargeIncreaseInterval);
                    return;
                }
                player.CurrentCharge = Math.min(player.CurrentCharge + (player.MaxCharge / 20), player.MaxCharge);
                SendStatUpdate(player, "CurrentCharge", socket);
            }, 250);
            var chargeDecreaseInterval = window.setInterval(()=>{
                if (player.ReadyState != ReadyStates.OK || player.CurrentCharge == 0){
                    window.clearInterval(chargeDecreaseInterval);
                    return;
                }
                player.CurrentCharge = Math.max(player.CurrentCharge - (player.MaxCharge / 20), 0);
                SendStatUpdate(player, "CurrentCharge", socket);
            }, 250);
            break;
        case "Result":
            if (jsonData.Result == "ok"){
                DataStore.Me.ReadyState = jsonData.ReadyState;
                if (DataStore.Me.ReadyState == ReadyStates.Charging){
                    UI.ChargingAnimationStart();
                }
                else if (DataStore.Me.ReadyState == ReadyStates.OK) {
                    UI.ChargingAnimationStop();
                }
            }
        break;
        default:
            break;
    }
}
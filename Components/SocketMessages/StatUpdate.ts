import { SendToTargetServer, SendToSpecificSocket } from "../SocketData";
import { Utilities, SessionManager, DataStore, UI, Connectivity } from "../All";
import * as net from "net";
import { SocketConnection, Void, ReadyStates, Player } from "../../Models/All";

export function SendStatUpdate(player: Player, stat:string, socket: SocketConnection) {
    SendToSpecificSocket({
        Type: "StatUpdate",
        Stage: "Result",
        Result: "ok",
        Stat: stat,
        Value: player[stat],
        ID: Utilities.CreateGUID()
    }, socket);
}

export function ReceiveStatUpdate(jsonData:any) {
    if (jsonData["Result"] == "ok") {
        DataStore.Me[jsonData["Stat"]] = jsonData["Value"];
    }
}
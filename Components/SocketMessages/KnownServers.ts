import { SendToSpecificSocket } from "../SocketData";
import * as net from "net";
import { Utilities, DataStore, Connectivity, UI } from "../All";
import * as electron from "electron";
import { KnownServer } from "../../Models/All";


export function SendKnownServers(socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "KnownServers",
        "ID": Utilities.CreateGUID(),
        "KnownServers": DataStore.KnownServers.filter(server => server.IsLocalNetwork != true)
    }, socket)
}
export function ReceiveKnownServers(jsonData: any, socket: net.Socket) {
    for (var i = 0; i < jsonData.KnownServers.length; i++) {
        var server = jsonData.KnownServers[i];
        if (
            DataStore.BlockedServers.some((value) => {
                return value.Host == server.Host && value.Port == server.Port;
            })
        ) {
            continue;
        }
        Utilities.AppendIfMissing(DataStore.KnownServers, jsonData.KnownServers[i], ["Host", "Port"]);
    }
}
import { SendToSpecificSocket } from "../SocketData";
import * as net from "net";
import { Utilities, DataStore, Connectivity, UI } from "../All";
import * as electron from "electron";
import { SendHelloFromServerToClient } from "./HelloFromServerToClient";
import { SendKnownServers } from "./KnownServers";

export function SendHelloFromClientToServer(socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromClientToServer",
        "ID": Utilities.CreateGUID(),
        "ServerID": DataStore.ConnectionSettings.ServerID,
        "ShouldBroadcast": false,
        "ProcessID": electron.remote.app.getAppMetrics()[0].pid
    }, socket)
}
export function ReceiveHelloFromClientToServer(jsonData: any, socket: net.Socket) {
    Connectivity.ClientConnections.push(socket);
    $("#spanClientConnections").text(Connectivity.ClientConnections.length.toString());
    UI.AddDebugMessage(`Connection received from ${socket.remoteAddress}.`, null, 1);
    SendHelloFromServerToClient(socket);
    SendKnownServers(socket);
}
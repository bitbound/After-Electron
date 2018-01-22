import { SendToSpecificSocket } from "../SocketData";
import * as net from "net";
import { Utilities, DataStore, Connectivity, UI } from "../All";
import * as electron from "electron";
import { SendKnownServers } from "./KnownServers";
import { SocketConnection } from "../../Models/All";

export function SendHelloFromServerToClient(socket: SocketConnection) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToClient",
        "ID": Utilities.CreateGUID(),
        "ServerID": DataStore.ConnectionSettings.ServerID,
        "ShouldBroadcast": false,
        "ProcessID": electron.remote.app.getAppMetrics()[0].pid
    }, socket)
}
export function ReceiveHelloFromServerToClient(jsonData: any, socket: SocketConnection) {
    if (jsonData.ServerID == DataStore.ConnectionSettings.ServerID && jsonData.ProcessID == electron.remote.app.getAppMetrics()[0].pid) {
        var server = DataStore.KnownServers.find(x => x.Host == Connectivity.OutboundConnection.Server.Host
            && x.Port == Connectivity.OutboundConnection.Server.Port);
        server.ID == jsonData.ServerID;
        Utilities.UpdateAndAppend(DataStore.KnownServers, server, ["Host", "Port"]);
        UI.AddSystemMessage("Client attempted to connect to self.  Your known servers have been reorganized.", 1);
        socket.end();
        return;
    }
    Connectivity.OutboundConnection.Server.ID = jsonData.ServerID;
    SendKnownServers(socket);
}
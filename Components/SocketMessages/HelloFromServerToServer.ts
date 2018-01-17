import { SendToSpecificSocket } from "../SocketData";
import * as net from "net";
import { Utilities, DataStore, Connectivity, UI } from "../All";
import * as electron from "electron";
import { KnownServer } from "../../Models/All";
import { SendKnownServers } from "./KnownServers";

export function SendHelloFromServerToServer(toServer: KnownServer, socket: net.Socket) {
    SendToSpecificSocket({
        "Type": "HelloFromServerToServer",
        "ID": Utilities.CreateGUID(),
        "ServerID": DataStore.ConnectionSettings.ServerID,
        "KnownServer": toServer,
        "ShouldBroadcast": false,
        "ProcessID": electron.remote.app.getAppMetrics()[0].pid
    }, socket)
}
export function ReceiveHelloFromServerToServer(jsonData: any, socket: net.Socket) {
    if (jsonData.ServerID == DataStore.ConnectionSettings.ServerID && jsonData.ProcessID == electron.remote.app.getAppMetrics()[0].pid) {
        var server = DataStore.KnownServers.find(x => x.Host == jsonData.KnownServer.Host && x.Port == jsonData.KnownServer.Port);
        server.ID == jsonData.ServerID;
        Utilities.UpdateAndAppend(DataStore.KnownServers, server, ["Host", "Port"]);
        UI.AddSystemMessage("Server attempted to connect to self.  Your known servers have been reorganized.", 1);
        socket.end();
        return;
    }
    Connectivity.ServerToServerConnections.push(socket);
    $("#spanServerConnections").text(Connectivity.ServerToServerConnections.length.toString());
    UI.AddDebugMessage(`Server connection received from ${socket.remoteAddress}.`, null, 1);
    SendKnownServers(socket);
}
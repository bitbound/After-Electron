import * as After from "../After";

After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();

if (After.Storage.ClientSettings.TCPServerEnabled) {
    After.Storage.KnownTCPServers.push(new After.Models.KnownTCPServer("127.0.0.1", After.Storage.ClientSettings.TCPServerPort));
    After.Connectivity.TCP.StartServer();
    // TODO: Start server.
}
if (After.Storage.ClientSettings.MultiplayerEnabled) {
    After.Storage.KnownTCPServers.forEach((value, index) => {
        After.Connectivity.TCP.ConnectToServer(value.IP, value.Port, false);
        // TODO: Attempt passive connections.
    })
}
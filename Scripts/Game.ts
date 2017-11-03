import * as After from "../After";

After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
if (After.Storage.ClientSettings.TCPServerEnabled) {
    // TODO: Start server.
}
if (After.Storage.ClientSettings.MultiplayerEnabled) {
    After.Storage.KnownTCPServers.forEach((value, index) => {
        // TODO: Attempt passive connections.
    })
}
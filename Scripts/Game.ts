import * as After from "../After";

export var Init = async function (){
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ClientSettings.TCPServerEnabled) {
        After.Storage.KnownTCPServers.push(new After.Models.KnownTCPServer("127.0.0.1", After.Storage.ClientSettings.TCPServerPort));
        After.Connectivity.TCP.StartServer();
        // TODO: Start server.
    }
    if (After.Storage.ClientSettings.MultiplayerEnabled) {
        for (var i = 0; i < After.Storage.KnownTCPServers.length; i++){
            var server = After.Storage.KnownTCPServers[i];
            if (await After.Connectivity.TCP.ConnectToServer(server.IP, server.Port, false))
            {
                break;
            }
        }
    }
}


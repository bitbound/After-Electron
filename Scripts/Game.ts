import * as After from "../After";

export var Init = async function (){
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ClientSettings.TCPServerEnabled) {
        After.Connectivity.StartServer();
    }
    if (After.Storage.ClientSettings.MultiplayerEnabled) {
        for (var i = 0; i < After.Storage.KnownTCPServers.length; i++){
            var server = After.Storage.KnownTCPServers[i];
            if (await After.Connectivity.ConnectToServer(server.IP, server.Port, After.Models.ConnectionTypes.PassiveClient))
            {
                break;
            }
        }
    }
    if (After.Connectivity.OutboundConnection.IsConnected()){
        After.SocketDataIO.SendHelloAsPassiveClient();
    }
    else {
        After.Connectivity.OutboundConnection.ActiveServerID = After.Connectivity.Server.ID;
    }
}


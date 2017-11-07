import * as After from "../After";

export var Init = async function (){
    After.UI.MessageWindow.shadowRoot.innerHTML = "";
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ClientSettings.TCPServerEnabled) {
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
        if (After.Connectivity.TCP.OutSocket.IsConnected()){
            After.SocketDataHandlers.SendHelloAsPassiveClient();
        }
    }
}


import * as After from "../After";

export var Init = async function (){
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ClientSettings.TCPServerEnabled) {
        After.Connectivity.StartServer();
    }
    if (After.Storage.ClientSettings.MultiplayerEnabled) {
        var connectAsPassiveClient = async function(){
            After.UI.AddSystemMessage("Attempting to find a server.", 1);
            for (var i = 0; i < After.Storage.KnownTCPServers.length; i++){
                try {
                    var server = After.Storage.KnownTCPServers[i];
                    if (await After.Connectivity.ConnectToServer(server.IP, server.Port, After.Models.ConnectionTypes.PassiveClient))
                    {
                        break;
                    }
                    else {
                        After.Storage.KnownTCPServers[i].BadConnectionAttempts++;
                    }
                }
                catch (ex) {
                    After.Storage.KnownTCPServers[i].BadConnectionAttempts++;
                }
                
            }
            if (After.Connectivity.OutboundConnection.IsConnected() == false){
                After.UI.AddSystemMessage("Unable to find a server.  Another attempt will be made in 30 seconds.", 1);
                window.setTimeout(async ()=>{
                    if (After.Storage.ClientSettings.MultiplayerEnabled)
                    {
                        await connectAsPassiveClient();
                    }
                }, 30000);
            }
        }
        await connectAsPassiveClient();
    }
    if (After.Connectivity.OutboundConnection.IsConnected()){
        After.SocketDataIO.SendHelloAsPassiveClient();
    }
    else {
        After.Connectivity.OutboundConnection.ActiveServerID = After.Connectivity.Server.ID;
    }
}


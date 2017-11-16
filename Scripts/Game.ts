import * as After from "../After";

export var Init = async function (){
    After.Storage.Me.CurrentLocationID = After.Storage.Me.InnerVoidID;
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ServerSettings.IsEnabled) {
        After.Connectivity.StartServer();
    }
    if (After.Storage.ClientSettings.IsMultiplayerEnabled) {
        var connectAsClient = async function(){
            After.UI.AddSystemMessage("Attempting to find a server.", 1);
            for (var i = 0; i < After.Storage.KnownServers.length; i++){
                try {
                    var server = After.Storage.KnownServers[i];
                    if (await After.Connectivity.ConnectToServer(server, After.Models.ConnectionTypes.ClientToServer))
                    {
                        After.UI.AddSystemMessage("Connected to server.", 1);
                        break;
                    }
                    else {
                        After.Storage.KnownServers[i].BadConnectionAttempts++;
                    }
                }
                catch (ex) {
                    After.Storage.KnownServers[i].BadConnectionAttempts++;
                }
                
            }
            if (After.Connectivity.OutboundConnection.IsConnected() == false){
                After.UI.AddSystemMessage("Unable to find a server.  Another attempt will be made in 30 seconds.", 1);
                window.setTimeout(async ()=>{
                    if (After.Storage.ClientSettings.IsMultiplayerEnabled)
                    {
                        await connectAsClient();
                    }
                }, 30000);
            }
        }
        await connectAsClient();
    }
    if (!After.Connectivity.OutboundConnection.IsConnected()){
        After.Connectivity.OutboundConnection.TargetServerID = After.Connectivity.LocalServer.ID;
    }
}


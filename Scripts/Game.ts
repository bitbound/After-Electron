import * as After from "../After";
import { KnownServer, ConnectionTypes } from "../Models/Index";

export var Init = async function (){
    After.Storage.Me.CurrentLocationID = After.Storage.Me.InnerVoidID;
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ServerSettings.IsEnabled) {
        await After.Connectivity.StartServer();
    }
    if (After.Storage.ClientSettings.IsMultiplayerEnabled) {
        await After.Connectivity.FindClientToServerConnection();
    }
    After.Connectivity.OutboundConnection.TargetServerID = After.Storage.ServerSettings.ServerID;
}


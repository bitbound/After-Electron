import * as After from "../API/";
import { KnownServer, ConnectionTypes } from "../Models/Index";

export var Start = async function (){
    After.Components.Storage.Me.CurrentLocationID = After.Components.Storage.Me.InnerVoidID;
    After.Components.Storage.Me.CoreEnergy = 100;
    After.Components.Storage.Me.CoreEnergyPeak = 100;
    After.Components.Storage.Me.CurrentEnergy = 100;
    After.Components.Storage.Me.CurrentCharge = 0;
    After.Models.Void.Load(After.Components.Storage.Me.InnerVoidID).Display();
    
    if (After.Components.Storage.ServerSettings.IsEnabled) {
        await After.Components.Connectivity.StartServer();
    }
    if (After.Components.Storage.ClientSettings.IsMultiplayerEnabled) {
        await After.Components.Connectivity.FindClientToServerConnection();
    }
    After.Components.Connectivity.OutboundConnection.TargetServerID = After.Components.Storage.ServerSettings.ServerID;
}


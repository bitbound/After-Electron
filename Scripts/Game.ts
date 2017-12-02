import * as After from "../API/After";
import { KnownServer, ConnectionTypes } from "../Models/Index";

export var Start = async function (){
    After.Storage.Me.CurrentLocationID = After.Storage.Me.InnerVoidID;
    After.Storage.Me.CoreEnergy = 100;
    After.Storage.Me.CoreEnergyPeak = 100;
    After.Storage.Me.CurrentEnergy = 100;
    After.Storage.Me.CurrentCharge = 0;
    After.Models.Void.Load(After.Storage.Me.InnerVoidID).Display();
    
    if (After.Storage.ServerSettings.IsEnabled) {
        await After.Connectivity.StartServer();
    }
    if (After.Storage.ClientSettings.IsMultiplayerEnabled) {
        await After.Connectivity.FindClientToServerConnection();
    }
    After.Connectivity.OutboundConnection.TargetServerID = After.Storage.ServerSettings.ServerID;
}


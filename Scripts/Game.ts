import * as After from "../API/Index";
import { KnownServer, ConnectionTypes } from "../Models/Index";
import { Storage, Connectivity } from "../Components/Index";

export var Start = async function (){
    Storage.Me.CurrentLocationID = Storage.Me.InnerVoidID;
    Storage.Me.CoreEnergy = 100;
    Storage.Me.CoreEnergyPeak = 100;
    Storage.Me.CurrentEnergy = 100;
    Storage.Me.CurrentCharge = 0;
    After.Models.Void.Load(Storage.Me.InnerVoidID).Display();
    
    if (Storage.ServerSettings.IsEnabled) {
        await Connectivity.StartServer();
    }
    if (Storage.ClientSettings.IsMultiplayerEnabled) {
        await Connectivity.FindClientToServerConnection();
    }
    Connectivity.OutboundConnection.TargetServerID = Storage.ServerSettings.ServerID;
}


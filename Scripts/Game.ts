import * as After from "../API/Index";
import { KnownServer, ConnectionTypes } from "../Models/Index";
import { Storage, Connectivity } from "../Components/Index";

export var Start = async function (){
    Storage.Me.CurrentLocationID = Storage.Me.InnerVoidID;
    Storage.Me.CurrentCharge = 0;
    After.Models.Void.Load(Storage.Me.InnerVoidID).Display();
    
    if (Storage.ConnectionSettings.IsServerEnabled) {
        await Connectivity.StartServer();
    }
    if (Storage.ConnectionSettings.IsClientEnabled) {
        await Connectivity.FindClientToServerConnection();
    }
    Connectivity.OutboundConnection.TargetServerID = Storage.ConnectionSettings.ServerID;
}


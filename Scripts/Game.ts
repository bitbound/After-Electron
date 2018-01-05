import * as After from "../Exports";
import { KnownServer, ConnectionTypes } from "../Models/All";
import { Storage, Connectivity } from "../Components/All";

export var Start = async function (){
    Storage.Me.CurrentLocationID = Storage.Me.InnerVoidID;
    Storage.Me.CurrentCharge = 0;
    After.Models.Void.Load(Storage.Me.InnerVoidID).Display();
    
    if (Storage.ConnectionSettings.IsServerEnabled) {
        await Connectivity.StartServer();
        if (Storage.ConnectionSettings.IsNetworkSupport){
            await Connectivity.FindServerToServerConnection();
        }
    }
    if (Storage.ConnectionSettings.IsClientEnabled) {
        await Connectivity.FindClientToServerConnection();
    }
    Connectivity.OutboundConnection.TargetServerID = Storage.ConnectionSettings.ServerID;
}


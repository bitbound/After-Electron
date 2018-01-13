import * as After from "../Exports";
import { KnownServer, ConnectionTypes } from "../Models/All";
import { DataStore, Connectivity } from "../Components/All";

export var Start = async function (){
    DataStore.Me.CurrentLocationID = DataStore.Me.InnerVoidID;
    DataStore.Me.CurrentCharge = 0;
    After.Models.Void.Load(DataStore.Me.InnerVoidID).Display();
    
    if (DataStore.ConnectionSettings.IsServerEnabled) {
        await Connectivity.StartServer();
        if (DataStore.ConnectionSettings.IsNetworkSupport){
            await Connectivity.FindServerToServerConnection();
        }
    }
    if (DataStore.ConnectionSettings.IsClientEnabled) {
        await Connectivity.FindClientToServerConnection();
    }
    Connectivity.OutboundConnection.TargetServerID = DataStore.ConnectionSettings.ServerID;
}


import * as After from "../Exports";
import { KnownServer, ConnectionTypes, GameSession } from "../Models/All";
import { DataStore, Connectivity } from "../Components/All";

export var Start = async function (){
    DataStore.Me.CurrentSessionID = DataStore.Me.InnerVoidSessionID;
    DataStore.Me.CurrentVoidID = DataStore.Me.InnerVoidID;
    var session = GameSession.Load(DataStore.Me.CurrentSessionID);
    session.Players.push(DataStore.Me);
    DataStore.Temp.ActiveSessions.push(session);
    DataStore.Me.CurrentCharge = 0;
    After.Models.Void.Load(DataStore.Me.CurrentSessionID, DataStore.Me.CurrentVoidID).Display();
    
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


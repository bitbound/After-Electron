import * as After from "../Exports";
import { KnownServer, ConnectionTypes, GameSession, ReadyStates } from "../Models/All";
import { DataStore, Connectivity } from "../Components/All";

export var Start = async function (){
    DataStore.Me.CurrentSessionID = DataStore.Me.InnerVoidSessionID;
    DataStore.Me.CurrentVoidID = DataStore.Me.InnerVoidID;
    var session = GameSession.Load(DataStore.Me.CurrentSessionID);
    session.Players.push(DataStore.Me);
    DataStore.Temp.ActiveGameSession = session;
    DataStore.Me.CurrentCharge = 0;
    DataStore.Me.ReadyState = ReadyStates.OK;
    After.Models.Void.Load(DataStore.Me.CurrentSessionID, DataStore.Me.CurrentVoidID).Display();
    Connectivity.OutboundConnection.TargetServerID = DataStore.ConnectionSettings.ServerID;
    
    if (DataStore.ConnectionSettings.IsServerEnabled) {
        await Connectivity.StartServer();
        if (DataStore.ConnectionSettings.IsNetworkSupport){
            await Connectivity.FindServerToServerConnection();
        }
    }
    if (DataStore.ConnectionSettings.IsClientEnabled) {
        await Connectivity.FindClientToServerConnection();
    }
}


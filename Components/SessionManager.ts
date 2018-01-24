import { DataStore } from "../Scripts/Options";
import { Void } from "../Models/All";

export function FindVoidByPlayerID(playerID: string){
    var session = DataStore.Temp.ActiveSessions.find(x=>x.Players.some(y=>y.ID == playerID));
    var player = session.Players.find(x=>x.ID == playerID);
    return Void.Load(session.SessionID, player.CurrentVoidID);
}
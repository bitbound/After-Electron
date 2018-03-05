import { DataStore } from "../Scripts/Options";
import { Void, Player } from "../Models/All";

export function FindVoidByPlayerID(playerID: string): Void {
    var player = DataStore.Temp.ActiveGameSession.Players.find(x=>x.ID == playerID);
    return Void.Load(DataStore.Temp.ActiveGameSession.SessionID, player.CurrentVoidID);
}

export function FindPlayerByID(playerID:string) : Player {
    return DataStore.Temp.ActiveGameSession.Players.find(x=>x.ID == playerID);
}
import * as After from "../Exports";
import * as Audio from "../Components/Audio";
import * as Game from "./Game";
import { DataStore, Utilities, UI } from "../Components/All";
import { Void, GameSession } from "../Models/All";

export var Init = function() {
    DataStore.Me.ID = Utilities.CreateGUID();
    DataStore.Me.ChargeMod = 0;
    DataStore.Me.EnergyMod = 0;
    DataStore.Me.CoreEnergy = 100;
    DataStore.Me.CoreEnergyPeak = 100;
    DataStore.Me.CurrentEnergy = 100;
    DataStore.Me.CurrentCharge = 0;
    var session = new GameSession();
    session.BaseCampaign = "Inner Void";
    session.SessionName = "My Inner Void";
    session.Save();
    
    var innerVoid = new Void();
    innerVoid.SessionID = session.SessionID;
    innerVoid.Owner = DataStore.Me.ID;
    innerVoid.Color = DataStore.Me.Color;
    innerVoid.IsDestructible = false;
    innerVoid.IsInnerVoid = true;
    innerVoid.Title = DataStore.Me.Name + "'s Inner Void";
    innerVoid.Description = `Where are you?  The question lazily formulates in your mind.  Once it solidifies into a
                            true desire to know, the space around you suddenly changes.  The change is subtle but definitive,
                            and you recognize immediately that your will alone caused it to happen.  You are still surrounded
                            by emptiness, but you are in a small pocket of existence that you just now forced into being.
                            <br/><br/>
                            Perhaps you should try to alter this place further ("Void Alter" command)?`;
    innerVoid.Save();
    
    DataStore.Me.InnerVoidSessionID = session.SessionID;
    DataStore.Me.CurrentSessionID = session.SessionID;
    DataStore.Me.InnerVoidID = innerVoid.ID;
    DataStore.Me.CurrentVoidID = innerVoid.ID;
    DataStore.Temp.ActiveGameSession = session;
    session.Players.push(DataStore.Me);
    DataStore.SaveMe("0");
    UI.MessageWindow.html("");
    UI.AddMessageText("Welcome to the afterlife, " + DataStore.Me.Name + ".", 2);
    Audio.StopLoop();
    window.setTimeout(async function(){
        await Game.Start();
    },2000);
}

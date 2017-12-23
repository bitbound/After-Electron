import * as After from "../Exports";
import * as Audio from "../Components/Audio";
import * as Game from "./Game";
import { Storage, Utilities, UI } from "../Components/All";

Storage.Me.ID = Utilities.CreateGUID();
Storage.Me.ChargeMod = 0;
Storage.Me.EnergyMod = 0;
Storage.Me.CoreEnergy = 100;
Storage.Me.CurrentEnergy = 100;
Storage.Me.CurrentCharge = 0;
var innerVoid = new After.Models.Void();
innerVoid.Owner = Storage.Me.ID;
innerVoid.Color = Storage.Me.Color;
innerVoid.IsDestructible = false;
innerVoid.IsInnerVoid = true;
innerVoid.Title = Storage.Me.Name + "'s Inner Void";
innerVoid.Description = `Where are you?  The question lazily formulates in your mind.  Once it solidifies into a
                        true desire to know, the space around you suddenly changes.  The change is subtle but definitive,
                        and you recognize immediately that your will alone caused it to happen.  You are still surrounded
                        by emptiness, but you are in a small pocket of existence that you just now forced into being.
                        <br/><br/>
                        Perhaps you should try to alter this place further (VOID ALTER)?`;
innerVoid.Save();

Storage.Me.InnerVoidID = innerVoid.ID;
Storage.Me.CurrentLocationID = innerVoid.ID;
Storage.SaveMe("0");
UI.MessageWindow.html("");
UI.AddMessageText("Welcome to the afterlife, " + Storage.Me.Name + ".", 2);
Audio.StopLoop();
window.setTimeout(async function(){
    await Game.Start();
},2000);
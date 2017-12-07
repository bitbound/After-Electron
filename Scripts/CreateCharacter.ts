import * as After from "../API/";
import * as Audio from "../Components/Audio";
import * as Game from "./Game";

After.Components.Storage.Me.ID = After.Components.Utilities.CreateGUID();
After.Components.Storage.Me.CurrentEnergy = 100;
var innerVoid = new After.Models.Void();
innerVoid.Owner = After.Components.Storage.Me.ID;
innerVoid.Color = After.Components.Storage.Me.Color;
innerVoid.IsDestructible = false;
innerVoid.IsInnerVoid = true;
innerVoid.Title = After.Components.Storage.Me.Name + "'s Inner Void";
innerVoid.Description = `Where are you?  The question lazily formulates in your mind.  Once it solidifies into a
                        true desire to know, the space around you suddenly changes.  The change is subtle but definitive,
                        and you recognize immediately that your will alone caused it to happen.  You are still surrounded
                        by emptiness, but you are in a small pocket of existence that you just now forced into being.
                        <br/><br/>
                        Perhaps you should try to alter this place further (VOID ALTER)?`;
innerVoid.Save();

After.Components.Storage.Me.InnerVoidID = innerVoid.ID;
After.Components.Storage.Me.CurrentLocationID = innerVoid.ID;
After.Components.Storage.SaveMe("0");
After.Components.UI.RefreshUI();
After.Components.UI.MessageWindow.html("");
After.Components.UI.AddMessageText("Welcome to the afterlife, " + After.Components.Storage.Me.Name + ".", 2);
Audio.StopLoop();
window.setTimeout(async function(){
    await Game.Start();
},2000);
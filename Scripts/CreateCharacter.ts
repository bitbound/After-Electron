import * as After from "../After";
import * as Audio from "../Components/Audio";
import * as Game from "./Game";

After.Storage.Me.ID = After.Utilities.CreateGUID();
After.Storage.Me.CurrentEnergy = 100;
var innerVoid = new After.Models.Void();
innerVoid.ID = After.Utilities.CreateGUID();
innerVoid.Owner = After.Storage.Me.ID;
innerVoid.Color = After.Storage.Me.Color;
innerVoid.IsDestructible = false;
innerVoid.IsInnerVoid = true;
innerVoid.Title = After.Storage.Me.Name + "'s Inner Void";
innerVoid.Description = `Where are you?  The question lazily formulates in your mind.  Once it solidifies into a
                        true desire to know, the space around you suddenly changes.  The change is subtle but definitive,
                        and you recognize immediately that your will alone caused it to happen.  You are still surrounded
                        by emptiness, but you are in a small pocket of existence that you just now forced into being.
                        <br/><br/>
                        Perhaps you should try to alter this place further (VOID ALTER)?`;
innerVoid.Save();

After.Storage.Me.InnerVoidID = innerVoid.ID;

After.Storage.SaveMe("0");
After.UI.RefreshUI();
After.UI.MessageWindow.html("");
After.UI.AddMessageText("Welcome to the afterlife, " + After.Storage.Me.Name + ".", 2);
Audio.StopLoop();
window.setTimeout(async function(){
    await Game.Init();
},2000);
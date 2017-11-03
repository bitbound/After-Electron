import * as After from "../After";
import * as Audio from "../Components/Audio";

After.Storage.Me.Player.ID = After.Utilities.CreateGUID();
After.Storage.Me.Player.CurrentEnergy = 100;
var innerVoid = new After.Models.Void();
innerVoid.ID = After.Utilities.CreateGUID();
innerVoid.Owner = After.Storage.Me.Player.ID;
innerVoid.Title = After.Storage.Me.Player.Name + "'s Inner Void";
innerVoid.Description = `Where are you?  The question lazily formulates in your mind.  Once it solidifies into a
                        true desire to know, the space around you suddenly changes.  The change is subtle but definitive,
                        and you recognize immediately that your will alone caused it to happen.  You are still surrounded
                        by emptiness, but you are in a small pocket of existence that you just now forced into being.\r\n\r\n
                        
                        Perhaps you should try to ALTER this place further?`;
innerVoid.Save();

After.Storage.Me.Player.InnerVoidID = innerVoid.ID;

After.Storage.Me.Save("0");
After.UI.RefreshUI();
After.UI.MessageWindow.html("");
After.UI.AddMessageText("Welcome to the afterlife, " + After.Storage.Me.Player.Name + ".", 2);
Audio.StopLoop();
import { Command } from "../Models/All";
import { SocketDataIO, UI } from "./All";

export var Help = new Command("Help", "Global", `Provides Help for the supplied command (example: "Help Charge").`, "", function(parameters:Array<string>){
    if (!parameters || parameters.length == 0) {
        UI.AddSystemMessage((this as Command).HelpText, 1);
    };
    if (parameters instanceof Array == false){
        parameters = [ parameters.toString() ];
    }
    if (Object.keys(exports).some(x=>x.toLowerCase() == parameters[0].toLowerCase())) {
        UI.AddSystemMessage(exports[parameters[0]].HelpText, 1);
    }
    else {
        UI.AddSystemMessage("Unknown command.", 1);
    }
});
export var Charge =  new Command("Charge", "Global", "Begin charging.", "", function(parameters:Array<string>){
    //SocketDataIO.SendChargeStart();
});

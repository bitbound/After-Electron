import { Command } from "../Models/All";
import { UI } from "./All";

export var Help = new Command("Help", "Global",
    `Provides help information for the supplied command (example: "Help Charge").<br><br>For a list of all commands, use "Help" by itself.`,
    function(){ 
        return `${getHelpTitle(this)}List of commands (and category):<br>${Object.keys(exports).map((value)=>{
            return `${(exports[value] as Command).Name}&nbsp;&nbsp;&nbsp;(${(exports[value] as Command).Category})`;
        }).join("<br>")}`;
    },
    function(parameters:Array<string>){
        if (!parameters || parameters.length == 0) {
            UI.AddSystemMessage((this as Command).GetFullHelp(), 1);
            return;
        };
        if (parameters instanceof Array == false){
            parameters = [ parameters.toString() ];
        }
        var commandParameter = Object.keys(exports).find(x=>x.toLowerCase() == parameters[0].toLowerCase());
        if (commandParameter) {
            UI.AddSystemMessage((exports[commandParameter] as Command).GetFullHelp(), 1);
        }
        else {
            var category = parameters[0].charAt(0).toUpperCase() + parameters[0].substring(1).toLowerCase();
            var categoryMatches = Array.from(new Set(
                Object.keys(exports).filter(
                    x=>(exports[x] as Command).Category.toLowerCase() == category.toLowerCase()).map((value, index)=>{
                        return (exports[value] as Command).Category;
                    })
                ));
            if (categoryMatches.length == 1) {
                var commandsInCategory = Object.keys(exports).filter(x=>(exports[x] as Command).Category == categoryMatches[0]).join("<br>");
                var displayMessage = `<br><div style="display:inline-block; text-align:center; color: steelblue;">`;
                for (var i = 0; i < categoryMatches[0].length + 15; i++){
                    displayMessage += "#";
                }
                displayMessage += `<br>Commands in ${categoryMatches[0]}<br>`;
                for (var i = 0; i < categoryMatches[0].length + 15; i++){
                    displayMessage += "#";
                }
                displayMessage += `</div><br><br>${commandsInCategory}`;
                UI.AddSystemMessage(displayMessage,1);
            }
            else {
                UI.AddSystemMessage(`No help information found for "${parameters[0]}".`, 1);
            }
        }
});
export var Charge =  new Command("Charge", "Global", `Toggles charging (example: "Charge").`, function(){
    return `${getHelpTitle(this)}Toggles your current charging state.  Energy gained from charging is used for attacking, defending, and using powers.`;
}, function(parameters:Array<string>){
    //SocketDataIO.SendChargeStart();
});

function getHelpTitle(command:Command):string {
    var titleString = `<br/><div style="display:inline-block; text-align:center; color: steelblue;">`;
    for (var i = 0; i < command.Name.length + 15; i++){
        titleString += "#";
    }
    titleString += "<br/>Command: " + command.Name + "<br/>";
    for (var i = 0; i < command.Name.length + 15; i++){
        titleString += "#";
    }
    titleString += "</div><br><br>";
    titleString += command.SummaryText + "<br><br>";
    return titleString;
}
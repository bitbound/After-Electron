
import { Utilities, SocketData } from "../../Components/All";
import { Command } from "../../Models/All";
import { SendChargeToggle } from "../SocketMessages/All";

export default new Command("Charge", "Global", `Toggles charging (example: "Charge").`, function(){
    return `${this.GetHelpTitle()}Toggles your current charging state.  Energy gained from charging is used for attacking, defending, and using powers.`;
}, function(parameters:Array<string>){
    SendChargeToggle();
});
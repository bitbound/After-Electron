
import { Utilities, SocketDataIO } from "../../Components/All";
import { Command } from "../../Models/All";

export default new Command("Charge", "Global", `Toggles charging (example: "Charge").`, function(){
    return `${Utilities.GetHelpTitle(this)}Toggles your current charging state.  Energy gained from charging is used for attacking, defending, and using powers.`;
}, function(parameters:Array<string>){
    
    //SocketDataIO.SendChargeStart();
});
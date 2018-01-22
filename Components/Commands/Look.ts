import { Command, Void } from "../../Models/All";
import { DataStore, Utilities } from "../../Components/All";
import { SendLook } from "../SocketMessages/Look";

export default new Command("Look", "Global", `Display your current void (example: "Look").`, function(){
    return `${Utilities.GetHelpTitle(this)}Display the information for the void that you currently occupy.`;
}, function(parameters:Array<string>){
    SendLook();
});

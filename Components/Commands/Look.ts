import { Command, Void } from "../../Models/All";
import { DataStore } from "../../Components/All";

export default new Command("Look", "Global", `Display your current void (example: "Look").`, function(){
    return `Display the information for the void that you currently occupy.`;
}, function(parameters:Array<string>){
    Void.Load(DataStore.Me.CurrentSessionID, DataStore.Me.CurrentVoidID).Display();
});

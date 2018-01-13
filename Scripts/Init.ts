import * as After from "../Exports";
import * as electron from "electron";
import * as $ from "jquery";
import { Utilities, DataStore, UIEventHandler, UI } from "../Components/All";
import * as Splash from "../Scripts/Splash"

export function Start(){
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {
        Utilities.Log(JSON.stringify(error));
    }
    window["After"] = After;
    window["$"] = $;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        DataStore.SaveAll();
    });
    electron.ipcRenderer.on("options-update", (event, args)=>{
        DataStore.LoadSettings();
    });
    UIEventHandler.ApplyUIEventHandlers();
    UI.SetUIDatabinds();
    DataStore.LoadAll();
    window.setInterval(()=>{
        DataStore.SaveAll();
        // Remove old message counters.
        var messageCounts = DataStore.Temp.MessageCounters;
        for (var i = messageCounts.length - 1; i >= 0; i--){
            if (messageCounts[i].MessageTimes.every(x=>Date.now() - x > 300000)){
                messageCounts.splice(i, 1);
            }
        }
    }, DataStore.ApplicationSettings.AutoSaveIntervalSeconds * 1000);
    Splash.Start();
}
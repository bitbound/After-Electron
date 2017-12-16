import * as After from "../API/Index";
import * as electron from "electron";
import * as $ from "jquery";
import { Utilities, Storage, UIEventHandler, UI } from "../Components/All";

export function Start(){
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {
        Utilities.Log(JSON.stringify(error));
    }
    window["After"] = After;
    window["$"] = $;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        Storage.SaveAll();
    });
    electron.ipcRenderer.on("options-update", (event, args)=>{
        Storage.LoadSettings();
    });
    UIEventHandler.ApplyUIEventHandlers();
    UI.SetUIDatabinds();
    Storage.LoadAll();
    window.setInterval(()=>{
        Storage.SaveAll();
        // Remove old message counters.
        var messageCounts = Storage.Temp.MessageCounters;
        for (var i = messageCounts.length - 1; i >= 0; i--){
            if (messageCounts[i].MessageTimes.every(x=>Date.now() - x > 300000)){
                messageCounts.splice(i, 1);
            }
        }
    }, Storage.ApplicationSettings.AutoSaveIntervalSeconds * 1000);
}
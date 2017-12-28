import * as Components from "../Components/All";
import * as Models from "../Models/All";
import * as API from "../API/All";
import * as electron from "electron";
import * as $ from "jquery";
import { Utilities, Storage, UIEventHandler, UI } from "../Components/All";
import * as Splash from "../Scripts/Splash"

export function Start(){
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {
        Utilities.Log(JSON.stringify(error));
    }
    window["After"] = {
        "API": API,
        "Components": Components,
        "Models": Models
    };
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
    Splash.Start();
}
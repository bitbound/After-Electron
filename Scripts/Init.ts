import * as After from "../API/Index";
import * as electron from "electron";
import * as $ from "jquery";

export function Start(){
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {
        After.Components.Utilities.Log(JSON.stringify(error));
    }
    window["After"] = After;
    window["$"] = $;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        After.Components.Storage.SaveAll();
    });
    After.Components.UIEventHandler.ApplyUIEventHandlers();
    After.Components.Storage.LoadAll();
    window.setInterval(()=>{
        After.Components.Storage.SaveAll();
    
        // Remove old message counters.
        var messageCounts = After.Components.Storage.Temp.MessageCounters;
        for (var i = messageCounts.length - 1; i >= 0; i--){
            if (messageCounts[i].MessageTimes.every(x=>Date.now() - x > 300000)){
                messageCounts.splice(i, 1);
            }
        }
    }, After.Components.Storage.ClientSettings.AutoSaveIntervalSeconds * 1000);
    window.setInterval(()=>{
        After.Components.UI.RefreshUI();
    }, 1000)
}
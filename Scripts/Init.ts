import * as After from "../After";
import * as electron from "electron";
import * as $ from "jquery";

export function Start(){
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {
        After.Utilities.Log(JSON.stringify(error));
    }
    window["After"] = After;
    window["$"] = $;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        After.Storage.SaveAll();
    });
    After.UI.ApplyUIEventHandlers();
    After.Storage.LoadAll();
    window.setInterval(()=>{
        After.Storage.SaveAll();
    
        // Remove old message counters.
        var messageCounts = After.Storage.Temp.MessageCounters;
        for (var i = messageCounts.length - 1; i >= 0; i--){
            if (messageCounts[i].MessageTimes.every(x=>Date.now() - x > 300000)){
                messageCounts.splice(i, 1);
            }
        }
    }, After.Storage.ClientSettings.AutoSaveIntervalSeconds * 1000);
    window.setInterval(()=>{
        After.UI.RefreshUI();
    }, 1000)
}
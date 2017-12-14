import * as StorageData from "../Components/Storage"
import * as $ from "jquery";
import {Utilities} from "../Components/Index";
import * as electron from "electron";

export {StorageData};

export function switchContentFrame(e) {
    var clickedTab = e.currentTarget;
    $(".options-content").hide();
    $(".options-side-tab").removeClass("selected");
    $(clickedTab).addClass("selected");
    var targetID = clickedTab.innerHTML.trim().toLowerCase() + "Options";
    $("#" + targetID).fadeIn(200);
}

$(document).ready(function(){
    window["StorageData"] = StorageData;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        StorageData.SaveSettings();
        electron.ipcRenderer.send("options-update");
    });
    
    Utilities.SetAllDatabinds(()=>{StorageData.SaveSettings()});
    StorageData.LoadSettings();


    $(".options-side-tab").on("click", event=>{
        switchContentFrame(event);
    });
})
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
    electron.remote.getCurrentWindow().on("close", (event)=>{
        StorageData.SaveSettings();
        electron.ipcRenderer.send("options-update");
    });
    Utilities.DataBindTwoWay(StorageData.ApplicationSettings, "AutoSaveIntervalSeconds", $("#autoSaveInterval")[0], "value", null, null);
    Utilities.DataBindOneWay(StorageData.ApplicationSettings, "IsDebugModeEnabled", ()=>{$("#debugMode").attr("on", String(StorageData.ApplicationSettings.IsDebugModeEnabled))}, null);
    Utilities.DataBindOneWay(StorageData.ConnectionSettings, "IsClientEnabled", ()=>{$("#clientEnabled").attr("on", String(StorageData.ConnectionSettings.IsClientEnabled))}, null);
    Utilities.DataBindOneWay(StorageData.ConnectionSettings, "IsServerEnabled", ()=>{$("#serverEnabled").attr("on", String(StorageData.ConnectionSettings.IsServerEnabled))}, null);
    StorageData.LoadAll();
    window["StorageData"] = StorageData;
    $(".options-side-tab").on("click", event=>{
        switchContentFrame(event);
    });
    $(".toggle-switch-outer").on("click", e=>{
        if (e.currentTarget.getAttribute("on") == "true"){
            e.currentTarget.setAttribute("on", "false");
        } else {
            e.currentTarget.setAttribute("on", "true");
        }
        eval(e.currentTarget.getAttribute("data-property") + " = " + e.currentTarget.getAttribute("on"));
    });
})
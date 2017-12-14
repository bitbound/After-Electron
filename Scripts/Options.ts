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
    
    $(".menu-item-value input").each((index, elem)=>{
        Utilities.DataBindTwoWay(eval(elem.getAttribute("data-object")), elem.getAttribute("data-property"), elem, "value", null, null);
    })
    $(".toggle-switch-outer").each((index, elem)=>{
        Utilities.DataBindOneWay(eval(elem.getAttribute("data-object")), elem.getAttribute("data-property"), ()=>{
            elem.setAttribute("on", eval("String(" + elem.getAttribute("data-object") + "." + elem.getAttribute("data-property") + ")"));
        }, null);
    })

    StorageData.LoadSettings();

    $(".menu-item-value input").on("change", (e)=>{
        StorageData.SaveSettings();
    })
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
        eval(e.currentTarget.getAttribute("data-object") + "." + e.currentTarget.getAttribute("data-property") + " = " + e.currentTarget.getAttribute("on"));
        StorageData.SaveSettings();
    });
})
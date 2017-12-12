import * as StorageData from "../Components/Storage"
import * as $ from "jquery";
import {Utilities} from "../Components/Index";

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
    Utilities.DataBindTwoWay(StorageData.ClientSettings, "AutoSaveIntervalSeconds", $("#autoSaveInterval")[0], "value", null, null);
    StorageData.LoadAll();
    $(".options-side-tab").on("click", event=>{
        switchContentFrame(event);
    })
})
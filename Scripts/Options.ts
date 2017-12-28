import * as StorageData from "../Components/Storage"
import * as $ from "jquery";
import { Utilities } from "../Components/All";
import * as electron from "electron";
import * as fs from "fs";

export { StorageData };

export function switchContentFrame(e) {
    var clickedTab = e.currentTarget;
    $(".options-content").hide();
    $(".options-side-tab").removeClass("selected");
    $(clickedTab).addClass("selected");
    var targetID = clickedTab.innerHTML.trim().toLowerCase() + "Options";
    $("#" + targetID).fadeIn(200);
}

$(document).ready(function () {
    window["$"] = $;
    window["StorageData"] = StorageData;
    window["Utilities"] = Utilities;
    electron.remote.getCurrentWindow().on("close", (event) => {
        StorageData.SaveSettings();
        electron.ipcRenderer.send("options-update");
    });

    Utilities.SetAllDatabinds(() => { StorageData.SaveSettings() });
    StorageData.LoadSettings();


    $(".options-side-tab").on("click", event => {
        switchContentFrame(event);
    });

    $(".color-wheel-button").on("click", (elem) => {
        $("#colorPopup").remove();
        var input = $(elem).next();
        var popup = document.createElement("div");
        popup.id = "colorPopup";
        popup.classList.add("popup");
        $(popup).html(fs.readFileSync(electron.remote.app.getAppPath() + "/HTML/Color_Picker.html").toString());
        document.body.appendChild(popup);
        eval($(popup).find("script").text());
        var relatedInput = $(elem.currentTarget).next();
        var dataProperty = relatedInput.attr("data-object") + "." + relatedInput.attr("data-property");
        $(popup).find("#divBrushPreview").css("background-color", relatedInput.val().toString());
        $(popup).find("#setColorButton").on("click", (event)=>{
            relatedInput.val($(popup).find("#divBrushPreview").css("background-color"));
            $(relatedInput).change();
            $(popup).remove();
        })
    })
    var selectKnown = $("#knownServerList")[0] as HTMLSelectElement;
    for (var i = 0; i < StorageData.KnownServers.length; i++){
        var server =  StorageData.KnownServers[i];
        var option = document.createElement("option");
        option.value = server.ID;
        option.innerHTML = `${server.Host}:${server.Port}`;
        option.title = `Host: ${server.Host}\r\n`;
        option.title += `Port: ${server.Port}\r\n`;
        option.title += `ID: ${server.ID}\r\n`;
        option.title += `Bad Connection Attempts: ${server.BadConnectionAttempts}\r\n`;
        option.title += `Is Local: ${server.IsLocalNetwork}`;
        selectKnown.options.add(option);
    }
})
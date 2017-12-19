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
        $(popup).css({
            "position": "fixed",
            "left": "50%",
            "top": "50%",
            "transform": "translate(-50%, -50%)",
            "border-radius": "20px",
            "border": "2px solid white",
            "width": "80%",
            "height": "90%",
            "background-color": "black"
        });
        $(popup).html(fs.readFileSync(electron.remote.app.getAppPath() + "/HTML/Color_Picker.html").toString());
        document.body.appendChild(popup);
        eval($(popup).find("script").text());
        var dataProperty = $(elem.currentTarget).next().attr("data-object") + "." + $(elem.currentTarget).next().attr("data-property");
        // TODO.
    })
})
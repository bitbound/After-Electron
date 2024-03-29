import * as $ from "jquery";
import * as Utilities from "./Utilities";
import * as UI from "./UI";
import * as DataStore from "./DataStore";
import * as InputProcessor from "./InputProcessor";
import * as Intellisense from "./Intellisense";
import * as Connectivity from "./Connectivity";
import * as electron from "electron";
import { ReadyStates } from "../Models/ReadyStates";

// Properties 
export var ChargingAnimationInt: number;
export var InputBox: JQuery = $("#inputText");
export var InputModeSelector: JQuery = $("#inputSelector");
export var IntellisenseFrame: JQuery = $("#intellisenseFrame");
export var MainGrid: JQuery = $("#mainGrid");
export var MessageWindow: JQuery = $("#messageWindow");


// Functions 
function AppendMessageToWindow(message: string) {
    var shouldScroll = false;
    if (MessageWindow[0].scrollTop + MessageWindow[0].clientHeight >= MessageWindow[0].scrollHeight) {
        shouldScroll = true;
    }
    MessageWindow.append(message);
    if (shouldScroll) {
        MessageWindow[0].scrollTop = MessageWindow[0].scrollHeight;
    }
}
export function AddDebugMessage(message: string, jsonData: any, newLines: number) {
    if (DataStore.ApplicationSettings.IsDebugModeEnabled) {
        var jsonHTML = "";
        if (jsonData) {
            DataStore.Temp.JSONObjects = new Array<any>();
            jsonHTML = JSON.stringify(jsonData, function (key, value) {
                if (typeof value == "object" && value != null) {
                    if (DataStore.Temp.JSONObjects.findIndex(x => x == value) > -1) {
                        return "[Possible circular reference.]"
                    }
                    else {
                        DataStore.Temp.JSONObjects.push(value);
                    }
                }
                return value;
            }, "&emsp;").split("\n").join("<br/>").split(" ").join("&nbsp;");
        }
        var messageText = `<div style="color:${DataStore.ApplicationSettings.Colors.Debug}">[Debug]: ${Utilities.EncodeForHTML(message) + jsonHTML}</div>`;
        for (var i = 0; i < newLines; i++) {
            messageText += "<br>";
        }
        AppendMessageToWindow(messageText);
    }
}
export function AddMessageText(message: string, newLines: number) {
    var messageText = Utilities.EncodeForHTML(message);
    for (var i = 0; i < newLines; i++) {
        messageText += "<br>";
    }
    AppendMessageToWindow(messageText);
};
export function AddMessageHTML(html: string, newLines: number) {
    for (var i = 0; i < newLines; i++) {
        html += "<br>";
    }
    AppendMessageToWindow(html);
};
export function AddSystemMessage(message: string, newLines: number) {
    var messageText = `<div style="color:${DataStore.ApplicationSettings.Colors.System}">[System]: ${message}</div>`;
    for (var i = 0; i < newLines; i++) {
        messageText += "<br>";
    }
    AppendMessageToWindow(messageText);
}
export function AdjustMessageWindowHeight() {
    this.MainGrid.height("100%");
    var heightAdjust = 0;
    while (document.body.scrollHeight > document.documentElement.clientHeight) {
        heightAdjust++;
        this.MainGrid.height("calc(100% - " + String(heightAdjust) + "px" + ")");
    }
};

export function ChargingAnimationStart() {
    ChargingAnimationInt = window.setInterval(() => {
        if (DataStore.Me.ReadyState != ReadyStates.Charging) {
            if (DataStore.Me.CurrentCharge == 0) {
                $('#startChargeButton').show();
                window.clearInterval(ChargingAnimationInt);
            }
        }
        var divRect = $("#divCharge")[0].getBoundingClientRect();
        var riseHeight = $("#divCharge").height();
        var startLeft = Utilities.GetRandom($("#divCharge").width() * .15, $("#divCharge").width() * .85, true);
        var startTop = $("#divCharge").height() * .5;
        var part = document.createElement("div");
        part.classList.add("rising-particle");
        $(part).css({
            left: startLeft,
            top: startTop,
        });
        $("#divCharge").append(part);
        window.setTimeout(function (thisParticle) {
            $(thisParticle).remove();
        }, 1000, part);
        return;
    }, 75);

}
export function ChargingAnimationStop() {
    window.clearInterval(ChargingAnimationInt);
}

export function RefreshConnectivityBar() {
    $("#spanClientStatus").text((String(Connectivity.OutboundConnection.IsConnected()).replace("true", "Connected").replace("false", "Disconnected")));
    $("#spanServerStatus").text(String(Connectivity.LocalServer.IsListening()).replace("true", "Listening").replace("false", "Disabled"));
    $("#spanServerConnections").text(Connectivity.ServerToServerConnections.length.toString());
    $("#spanClientConnections").text(Connectivity.ClientConnections.length.toString());
}

export function ShowDevTools() {
    electron.remote.getCurrentWindow().webContents.openDevTools();
}
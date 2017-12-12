import * as $ from "jquery";
import * as Utilities from "./Utilities";
import * as UI from "./UI";
import * as Storage from "./Storage";
import * as InputProcessor from "./InputProcessor";
import * as Intellisense from "./Intellisense";
import * as Connectivity from "./Connectivity";
import * as electron from "electron";
import { ReadyStates } from "../Models/ReadyStates";

// Properties //
export var ChargingAnimationInt:number;
export var InputBox:JQuery = $("#inputText");
export var InputModeSelector:JQuery = $("#inputSelector");
export var IntellisenseFrame:JQuery = $("#intellisenseFrame");
export var MainGrid:JQuery = $("#mainGrid");
export var MessageWindow:JQuery = $("#messageWindow");


// Functions //
function AppendMessageToWindow(message:string){
    var shouldScroll = false;
    if (MessageWindow[0].scrollTop + MessageWindow[0].clientHeight >= MessageWindow[0].scrollHeight){
        shouldScroll = true;
    }
    MessageWindow.append(message);
    if (shouldScroll){
        MessageWindow[0].scrollTop = MessageWindow[0].scrollHeight;
    }
}
export function AddDebugMessage(message:string, newLines:number){
    var messageText = `<div style="color:${Storage.ClientSettings.Colors.Debug}">[Debug]: ${Utilities.EncodeForHTML(message)}</div>`;
    for (var i = 0; i < newLines; i++){
        messageText += "<br>";
    }
    AppendMessageToWindow(messageText);
    
}
export function AddMessageText(message:string, newLines:number){
    var messageText = Utilities.EncodeForHTML(message);
    for (var i = 0; i < newLines; i++){
        messageText += "<br>";
    }
    AppendMessageToWindow(messageText);
};
export function AddMessageHTML(html:string, newLines:number) {
    for (var i = 0; i < newLines; i++){
        html += "<br>";
    }
    AppendMessageToWindow(html);
};
export function AddSystemMessage(message:string, newLines:number){
    var messageText = `<div style="color:${Storage.ClientSettings.Colors.System}">[System]: ${message}</div>`;
    for (var i = 0; i < newLines; i++){
        messageText += "<br>";
    }
    AppendMessageToWindow(messageText);
}
export function AdjustMessageWindowHeight(){
    var heightAdjust = 0;
    while (document.body.scrollHeight > document.documentElement.clientHeight) {
        heightAdjust++;
        this.MainGrid.height("calc(100% - " + String(heightAdjust) + "px" + ")");
    }
};

export function ChargingAnimationStart(){
    Storage.Me.ReadyState = ReadyStates.Charging;
    ChargingAnimationInt = window.setInterval(()=>{
        if (Storage.Me.ReadyState != ReadyStates.Charging) {
            if (Storage.Me.CurrentCharge == 0) {
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
        window.setTimeout(function(thisParticle) {
            $(thisParticle).remove();
        }, 1000, part);
        return;
    }, 75);

}
export function ChargingAnimationStop(){
    
}
export function FadeInText(text:string, delayInMilliseconds:number, callback:Function){
    window.setTimeout((text)=>{
        UI.AddMessageText("", 2);
        for (var i = 0; i < text.length; i++){
            var letter = text.substr(i, 1);
            window.setTimeout((letter)=>{
                if (letter == " ") {
                    UI.AddMessageText(" ", 0);
                }
                else {
                    UI.AddMessageHTML("<div class='fade-in-text'>" + letter + "</div>", 0);
                }
            }, i * 30, letter)
        }
        if (callback){
            window.setTimeout(function(callback){
                callback();
            }, (text.length ) * 30, callback);
        }
    }, delayInMilliseconds, text);
}


export function RefreshConnectivityBar(){
    $("#spanClientStatus").text((String(Connectivity.OutboundConnection.IsConnected()).replace("true", "Connected").replace("false", "Disconnected")));
    $("#spanServerStatus").text(String(Connectivity.LocalServer.IsListening()).replace("true", "Listening").replace("false", "Disabled"));
    $("#spanServerConnections").text(Connectivity.ServerToServerConnections.length.toString());
    $("#spanClientConnections").text(Connectivity.ClientConnections.length.toString());
}
export function SetUIDatabinds(){
    Utilities.DataBindOneWay(Storage.Me, "CoreEnergy", function(){
        if (Storage.Me.CoreEnergy > Storage.Me.CoreEnergyPeak) {
            Storage.Me.CoreEnergyPeak = Storage.Me.CoreEnergy;
        }
        Storage.Me.MaxEnergy = Storage.Me.CoreEnergy + Storage.Me.EnergyMod;
        Storage.Me.MaxCharge = Storage.Me.CoreEnergy + Storage.Me.ChargeMod;
        $("#coreEnergySideMenu").text(Storage.Me.CoreEnergy);
        $("#peakCoreEnergySideMenu").text(Storage.Me.CoreEnergyPeak);
    }, null);

    Utilities.DataBindOneWay(Storage.Me, "CurrentEnergy", function(){
        $("#divEnergyAmount").text(Storage.Me.CurrentEnergy);
        $("#currentEnergySideMenu").text(Storage.Me.CurrentEnergy);
        $("#svgEnergy").css("width", String(Storage.Me.CurrentEnergy / Storage.Me.MaxEnergy * 100 || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(Storage.Me, "EnergyMod", function(){
        Storage.Me.MaxEnergy = Storage.Me.CoreEnergy + Storage.Me.EnergyMod;
        $("#energyModSideMenu").text(Storage.Me.EnergyMod);
        $("#maxEnergySideMenu").text(Storage.Me.MaxEnergy);
    }, null);
    Utilities.DataBindOneWay(Storage.Me, "MaxEnergy", function(){
        $("#maxEnergySideMenu").text(Storage.Me.MaxEnergy);
        $("#svgEnergy").css("width", String(Storage.Me.CurrentEnergy / Storage.Me.MaxEnergy * 100 || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(Storage.Me, "CurrentCharge", function(){
        $("#divChargeAmount").text(Storage.Me.CurrentCharge);
        $("#currentChargeSideMenu").text(Storage.Me.CurrentCharge);
        $("#svgCharge").css("width", String(Storage.Me.CurrentCharge / Storage.Me.MaxCharge * 100 || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(Storage.Me, "ChargeMod", function(){
        Storage.Me.MaxCharge = Storage.Me.CoreEnergy + Storage.Me.ChargeMod;
        $("#chargeModSideMenu").text(Storage.Me.ChargeMod);
        $("#maxChargeSideMenu").text(Storage.Me.MaxCharge);
    }, null);
    Utilities.DataBindOneWay(Storage.Me, "MaxCharge", function(){
        $("#maxChargeSideMenu").text(Storage.Me.MaxCharge);
        $("#svgCharge").css("width", String(Storage.Me.CurrentCharge / Storage.Me.MaxCharge * 100 || 0) + "%");
    }, null);
}
export function ShowDevTools(){
    electron.remote.getCurrentWindow().webContents.openDevTools();
}
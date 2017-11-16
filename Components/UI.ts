import * as $ from "jquery";
import * as Utilities from "./Utilities";
import * as UI from "./UI";
import * as Storage from "./Storage";
import * as InputProcessor from "./InputProcessor";
import * as Intellisense from "./Intellisense";
import * as Models from "./Models";

// Properties //
export var ChargingAnimationInt:number;
export var InputBox:JQuery = $("#inputText");
export var InputModeSelector:JQuery = $("#inputSelector");
export var IntellisenseFrame:JQuery = $("#intellisenseFrame");
export var MainGrid:JQuery = $("#mainGrid");
export var MessageWindow:JQuery = $("#messageWindow");


// Functions //
export function AddMessageText(message:string, newLines:number){
    MessageWindow.append(Utilities.EncodeForHTML(message));
    for (var i = 0; i < newLines; i++){
        MessageWindow.append("<br>");
    }
    MessageWindow[0].scrollTop = MessageWindow[0].scrollHeight;
};
export function AddMessageHTML(html:string, newLines:number) {
    MessageWindow.append(html);
    for (var i = 0; i < newLines; i++){
        MessageWindow.append("<br>");
    }
    MessageWindow[0].scrollTop = MessageWindow[0].scrollHeight;
};
export function AddSystemMessage(message:string, newLines:number){
    MessageWindow.append(`<div style="color:${Storage.ClientSettings.Colors.System}">[System]: ${message}</div>`);
    for (var i = 0; i < newLines; i++){
        MessageWindow.append("<br>");
    }
    MessageWindow[0].scrollTop = MessageWindow[0].scrollHeight;
}
export function AdjustMessageWindowHeight(){
    var heightAdjust = 0;
    while (document.body.scrollHeight > document.documentElement.clientHeight) {
        heightAdjust++;
        this.MainGrid.height("calc(100% - " + String(heightAdjust) + "px" + ")");
    }
};
export function ApplyEventHandlers(){
    $("#gridDivider").on("pointerdown", (e)=>{
        var initialWidth = $("#menuFrame").width();
        var initialX = e.screenX;
        $(window).on("pointermove", (e)=>{
            $("#menuFrame").width(initialWidth + initialX - e.screenX)
        });
        $(window).on("pointerup", (e)=>{
            $(window).off("pointermove");
            $(window).off("pointerup");
        });
    });
    $("#menuButton").on("click", (e)=>{
        $("#gridDivider").css({
            "width": "3px",
            "margin-right": "5px"
        });
        $("#menuButton").hide();
        $("#menuFrame").animate({
            width: "200px"
        })
    });
    $("#closeMenuButton").on("click", (e)=>{
        $("#menuFrame").animate({
            width: "0px"
        }, ()=>{
            $("#gridDivider").css({
                "width": "0px",
                "margin-right": "0px"
            });
            $("#menuButton").show();
        })
    });
    UI.InputBox.on("keydown", (e) => {
        if (e.key.toLowerCase() == "arrowup"){
            e.preventDefault();
            InputProcessor.GetPreviousInput();
        }
        else if (e.key.toLowerCase() == "arrowdown"){
            e.preventDefault();
            InputProcessor.GetNextInput();
        }
        else if (e.key.toLowerCase() == "tab" && InputModeSelector.val() == "Script"){
            e.preventDefault();
            Intellisense.AutoComplete();
        }
    })
    UI.InputBox.on("keypress", (e) =>{
        if (e.key.toLowerCase() == "enter"){
            InputProcessor.ProcessInput();
        }
    });
    
    // Check aliases.
    UI.InputBox.on("input", (e)=>{
        if (UI.InputBox.val().toString().toLowerCase() == Storage.ClientSettings.TextInputAliases.Command.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Command";
            UI.InputBox.val("");
        }
        else if (UI.InputBox.val().toString().toLowerCase() == Storage.ClientSettings.TextInputAliases.GlobalChat.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Global Chat";
            UI.InputBox.val("");
        }
        else if (UI.InputBox.val().toString().toLowerCase() == Storage.ClientSettings.TextInputAliases.VoidChat.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Void Chat";
            UI.InputBox.val("");
        }
        else if (UI.InputBox.val().toString().toLowerCase() == Storage.ClientSettings.TextInputAliases.Script.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Script";
            UI.InputBox.val("");
        }
        if (InputModeSelector.val() == "Script") {
            Intellisense.Evaluate();
        }
    });
};
export function ChargingAnimationStart(){
    Storage.Me.ReadyState = Models.ReadyStates.Charging;
    ChargingAnimationInt = window.setInterval(()=>{
        if (Storage.Me.ReadyState != Models.ReadyStates.Charging) {
            if (Storage.Me.CurrentCharge == 0) {
                $('#startChargeButton').show();
                $('#chargePoolFrame').hide();
                window.clearInterval(ChargingAnimationInt);
            }
        }
        var divRect = $("#chargePoolFrame")[0].getBoundingClientRect();
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
                UI.AddMessageHTML("<span class='fade-in-text'>" + letter + "</span>", 0);
            }, i * 30, letter)
        }
        if (callback){
            window.setTimeout(function(callback){
                callback();
            }, (text.length ) * 30, callback);
        }
    }, delayInMilliseconds, text);
}


export function RefreshUI(){
    $("#divEnergyAmount").text(Storage.Me.CurrentEnergy);
    $("#svgEnergy").css("width", String(Storage.Me.CurrentEnergy / Storage.Me.MaxEnergy * 100 || 0) + "%");
    $("#divChargeAmount").text(Storage.Me.CurrentCharge);
    $("#svgCharge").css("width", String(Storage.Me.CurrentCharge / Storage.Me.MaxCharge * 100 || 0) + "%");
    $("#spanMultiplayerStatus").text(String(Storage.ClientSettings.MultiplayerEnabled).replace("true", "Enabled").replace("false", "Disabled"));
    $("#spanTCPServerStatus").text(String(Storage.ClientSettings.TCPServerEnabled).replace("true", "Enabled").replace("false", "Disabled"));
    $("#spanPassiveConnections").text(Storage.Temp.PassiveTCPClientConnections.length.toString());
    $("#spanActiveConnections").text(Storage.Temp.ActiveTCPClientConnections.length.toString());
}

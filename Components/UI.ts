import * as $ from "jquery";
import * as Utilities from "./Utilities";
import * as UI from "./UI";
import * as Storage from "./Storage";

export var MessageWindow:JQuery = $("#messageWindow");
export var TextInput:JQuery = $("#inputText");

export var InputHandler:Function;

export function AddMessageText(message:string, newLines:number){
    this.MessageWindow.append(Utilities.EncodeForHTML(message));
    for (var i = 0; i < newLines; i++){
        this.MessageWindow.append("<br>");
    }
    this.MessageWindow.scrollTop(this.MessageWindow[0].scrollHeight);
};
export function AddMessageHTML(html:string, newLines:number) {
    this.MessageWindow.append(html);
    for (var i = 0; i < newLines; i++){
        this.MessageWindow.append("<br>");
    }
    this.MessageWindow.scrollTop(this.MessageWindow[0].scrollHeight);
};
export function ProcessInput() {
    var input = UI.TextInput.val() as string;
    UI.TextInput.val("");
    if (this.InputHandler != null){
        this.InputHandler(input);
        this.InputHandler = null;
        return;
    }
    if (input.trim().length == 0){
        return;
    }
};
export function RefreshUI(){
    $("#divEnergyAmount").text(Storage.Me.CurrentEnergy);
    $("#svgEnergy").css("width", String(Storage.Me.CurrentEnergy / Storage.Me.MaxEnergy * 100 || 0) + "%");
    $("#divChargeAmount").text(Storage.Me.CurrentCharge);
    $("#svgCharge").css("width", String(Storage.Me.CurrentCharge / Storage.Me.MaxCharge * 100 || 0) + "%");
}
export function SetInputHandler(handlerFunction) {
    window.setTimeout((handlerFunction)=>{
        this.InputHandler = handlerFunction;
    }, 50, handlerFunction);
};

export function ApplyEventHandlers(){
    UI.TextInput.on("keypress", (e) =>{
        if (e.key.toLowerCase() == "enter"){
            UI.ProcessInput();
        }
    })
};

export function FadeInText(text:string, delayInMilliseconds:number){
    window.setTimeout((text)=>{
        UI.AddMessageText("", 2);
        for (var i = 0; i < text.length; i++){
            var letter = text.substr(i, 1);
            window.setTimeout((letter)=>{
                UI.AddMessageHTML("<span class='fade-in-text'>" + letter + "</span>", 0);
            }, i * 30, letter)
        }
    }, delayInMilliseconds, text);
}
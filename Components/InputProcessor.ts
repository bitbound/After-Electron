import {UI, SocketData, DataStore, Utilities } from "./All";
import { Command } from "../Models/All";
import * as Commands from "../Components/Commands/All";
import { SendChat } from "./SocketMessages/Chat";

export var NextInputHandler:Function;

export var InputHistory = new Array<Array<string>>();
export var InputHistoryPosition = -1;

export function GetNextInput() {
    if (InputHistoryPosition > 0){
        InputHistoryPosition--;
        UI.InputBox.val(InputHistory[InputHistoryPosition][1]);
        UI.InputModeSelector.val(InputHistory[InputHistoryPosition][0]);
        (UI.InputBox[0] as HTMLInputElement).setSelectionRange(UI.InputBox.val().toString().length, UI.InputBox.val().toString().length);
    }
}
export function GetPreviousInput() {
    if (InputHistoryPosition + 1 < InputHistory.length){
        InputHistoryPosition++;
        UI.InputBox.val(InputHistory[InputHistoryPosition][1]);
        UI.InputModeSelector.val(InputHistory[InputHistoryPosition][0]);
        (UI.InputBox[0] as HTMLInputElement).setSelectionRange(UI.InputBox.val().toString().length, UI.InputBox.val().toString().length);
    }
}
export function ProcessInput(){
    var input = UI.InputBox.val() as string;
    UI.InputBox.val("");
    if (this.NextInputHandler != null){
        this.NextInputHandler(input);
        this.NextInputHandler = null;
        return;
    }
    if (input.trim().length == 0){
        return;
    }
    while (InputHistory.length > 50){
        InputHistory.pop();
    }
    InputHistoryPosition = -1;
    var inputMode = UI.InputModeSelector.val() as string;
    InputHistory.unshift([ inputMode, input ]);
    switch (inputMode) {
        case "Script":
            try {
                UI.IntellisenseFrame.hide();
                var result = eval(input);
                var output = "";
                if (result instanceof Function){
                    output = result.toString();
                }
                else if (result instanceof Object){
                    DataStore.Temp.JSONObjects = new Array<any>();
                    output = JSON.stringify(result, function(key, value) {
                        if (typeof value == "object" && value != null) {
                            if (DataStore.Temp.JSONObjects.findIndex(x=>x == value) > -1) {
                                return "[Possible circular reference.]"
                            }
                            else {
                                DataStore.Temp.JSONObjects.push(value);
                            }
                        }
                        return value;
                    }, "&emsp;");
                }
                else {
                    output = String(result);
                }
                UI.AddSystemMessage(output.split("\n").join("<br/>").split(" ").join("&nbsp;"), 1);
            }
            catch (ex){
                UI.AddSystemMessage(ex, 1);
            }
            break;
        case "GlobalChat":
            SendChat(input, "GlobalChat");
            break;
        case "VoidChat":
            SendChat(input, "VoidChat");
            break;
        case "Command":
            UI.IntellisenseFrame.hide();
            var inputArray = input.trim().split(" ");
            var command = Object.keys(Commands).find(value=>{ 
                return value.toLowerCase() == inputArray[0].toLowerCase();
            });
            if (command){
                inputArray.splice(0, 1);
                (Commands[command] as Command).Execute(inputArray);
            }
            else {
                UI.AddSystemMessage("Unknown command.", 1);
            }
            break;
        default:
            break;
    }
}

export function SetNextInputHandler(handlerFunction) {
    window.setTimeout((handlerFunction)=>{
        this.NextInputHandler = handlerFunction;
    }, 50, handlerFunction);
};
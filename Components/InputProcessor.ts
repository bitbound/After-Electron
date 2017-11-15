import * as UI from "./UI";
import * as SocketDataIO from "./SocketDataIO";
import * as Storage from "./Storage";
import * as Utilities from "./Utilities";


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
                var output = result instanceof Object ? JSON.stringify(result, null, "&emsp;") : result;
                UI.AddSystemMessage(Utilities.ReplaceAllInString(output, "\n", "<br/>"), 1);
            }
            catch (ex){
                UI.AddSystemMessage(ex, 1);
            }
            break;
        case "Global Chat":
            SocketDataIO.SendChat(input, "GlobalChat");
            break;
        case "Void Chat":
            SocketDataIO.SendChat(input, "VoidChat");
            break;
        case "Command":
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
import * as UI from "./UI";
import * as SocketDataHandlers from "./SocketDataHandlers";

export function ProcessInput(input:string){
    switch (UI.InputModeSelector.val()) {
        case "Script":
            eval(input);
            break;
        case "Global Chat":
            SocketDataHandlers.SendChat(input, "GlobalChat");
            break;
        case "Void Chat":
            SocketDataHandlers.SendChat(input, "VoidChat");
            break;
        case "Command":
            break;
        default:
            break;
    }
}
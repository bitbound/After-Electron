import * as UI from "./UI";
import * as SocketDataHandlers from "./SocketDataHandlers";

export function ProcessInput(input:string){
    switch (UI.InputModeSelector.val()) {
        case "Script":
            break;
        case "Global Chat":
            SocketDataHandlers.SendChat(input, "GlobalChat");
            break;
        case "Void Chat":
            break;
        case "Command":
            break;
        default:
            break;
    }
}
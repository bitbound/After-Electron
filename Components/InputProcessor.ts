import * as UI from "./UI";
import * as SocketDataIO from "./SocketDataIO";

export function ProcessInput(input:string){
    switch (UI.InputModeSelector.val()) {
        case "Script":
            eval(input);
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
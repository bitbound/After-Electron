import { Broadcast } from "../SocketData";
import { Utilities, DataStore, UI } from "../All";
import * as net from "net";

export function SendChat(message: string, channel: string) {
    Broadcast({
        "Type": "Chat",
        "ID": Utilities.CreateGUID(),
        "From": DataStore.Me.Name,
        "Channel": channel,
        "Message": message
    });
}

export function ReceiveChat(jsonData: any, socket: net.Socket) {
    switch (jsonData.Channel) {
        case "GlobalChat":
            UI.AddMessageHTML(`<span style='color:` +
                DataStore.ApplicationSettings.Colors.GlobalChat + `'>[Global] ` +
                Utilities.EncodeForHTML(jsonData.From) + `: </span>` +
                Utilities.EncodeForHTML(jsonData.Message), 1);
            break;

        default:
            break;
    }
}
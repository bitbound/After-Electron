import * as Utilities from "../Components/Utilities"
import * as net from "net";
import { Player } from "./Player";
import { DataStore } from "../Scripts/Options";
import { Connectivity } from "../Components/All";

export class SocketConnection extends net.Socket {
    ID: string;
    PlayerID: string;
    IsMock:boolean;

    static GetMock():SocketConnection {
        var sc = new SocketConnection();
        sc.ID = DataStore.Me.ID;
        sc.PlayerID = DataStore.Me.ID;
        sc.IsMock = true;
        return sc;
    }
};
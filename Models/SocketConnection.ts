import * as Utilities from "../Components/Utilities"
import * as net from "net";
import { Player } from "./Player";

export class SocketConnection extends net.Socket {
    ID: string;
    PlayerID: string;
};
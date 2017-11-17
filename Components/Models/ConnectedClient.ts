import * as Utilities from "../Utilities";
import * as net from "net";
import { Player } from "./Player";

export class ConnectedClient {
    Socket: net.Socket;
    ID: string = Utilities.CreateGUID();
    Player: Player;
};
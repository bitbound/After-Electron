import * as Utilities from "../Components/Utilities"
import * as net from "net";
import { Player } from "./Player";

export class ConnectedClient {
    Socket: net.Socket;
    Player: Player;
};
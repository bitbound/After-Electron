import * as Utilities from "../Utilities";
import { Player } from "./Player";

export class ConnectedClient {
    Socket: NodeJS.Socket;
    ID: string = Utilities.CreateGUID();
    Player: Player;
};
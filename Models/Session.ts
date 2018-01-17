import { Player } from "./All";

export class Session {
    SessionID: string;
    Players:Array<Player> = new Array<Player>();
    BaseCampaign: string;
    SaveDir: string;
}
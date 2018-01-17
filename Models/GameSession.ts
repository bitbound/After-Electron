import { Player } from "./All";
import { FileSystem, Utilities } from "../Components/All";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "original-fs";
import { join, dirname } from "path";

export class GameSession {
    SessionID: string = Utilities.CreateGUID();
    Players:Array<Player> = new Array<Player>();
    BaseCampaign: string;
    SessionName: string;
    get SavePath():string {
        return join(FileSystem.StorageDataPath, `GameSessions`, `${this.SessionID}`, `${this.SessionID}.json`);
    }
    static Load(sessionID: string) : GameSession {
        if (existsSync(join(FileSystem.StorageDataPath, `GameSessions`, `${sessionID}`, `${sessionID}.json`)) == false) {
            throw Error("Game session doesn't exist.");
        }
        return $.extend(true, new this(), JSON.parse(readFileSync(join(FileSystem.StorageDataPath, `GameSessions`, `${sessionID}.json`)).toString()));
    }
    Save(){
        if (this.SessionID == null)
        {
            throw Error("SessionID isn't set.");
        }
        if (existsSync(dirname(this.SavePath)) == false) {
            FileSystem.MakeDirectoriesRecursively(dirname(this.SavePath));
        }
        writeFileSync(this.SavePath, JSON.stringify(this));
    }
}
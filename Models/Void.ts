import * as Utilites from "../Components/Utilities";
import * as FileSystem from "../Components/FileSystem";
import * as UI from "../Components/UI";
import * as fs from "fs";
import * as path from "path";
import { NPC } from "./NPC";

export class Void {
    Color: string;
    Description:string;
    ID:string = Utilites.CreateGUID();
    IsDestructible: boolean;
    IsInnerVoid: boolean;
    NPCs: NPC[];
    Owner: string;
    Title:string;
    SessionID:string;
    get SavePath():string {
        return path.join(FileSystem.StorageDataPath, `GameSessions`, `${this.SessionID}`, `Voids`, `${this.ID}.json`);
    }
    Display(){
        var displayMessage = `<br/><br/><div style="text-align: center; color: ` + this.Color +`;">`;
        for (var i = 0; i < this.Title.length + 6; i++){
            displayMessage += "#";
        }
        displayMessage += "<br/>" + this.Title + "<br/>";
        for (var i = 0; i < this.Title.length + 6; i++){
            displayMessage += "#";
        }
        displayMessage += "</div><br/><br/>" + this.Description;
        UI.AddMessageHTML(displayMessage, 2);
    }
    static Load(sessionID: string, voidID:string) : Void {
        if (fs.existsSync(path.join(FileSystem.StorageDataPath, `GameSessions`, `${sessionID}`, `Voids`, `${voidID}.json`)) == false) {
            throw Error("Void doesn't exist.");
        }
        return $.extend(true, new this(), JSON.parse(fs.readFileSync(path.join(FileSystem.StorageDataPath, `GameSessions`, `${sessionID}`, `Voids`, `${voidID}.json`)).toString()));
    }
    Save(){
        if (this.SessionID == null)
        {
            throw Error("SessionID isn't set.");
        }
        if (fs.existsSync(path.dirname(this.SavePath)) == false) {
            FileSystem.MakeDirectoriesRecursively(path.dirname(this.SavePath));
        }
        fs.writeFileSync(this.SavePath, JSON.stringify(this));
    }
};
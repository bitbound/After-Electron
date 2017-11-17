import * as Utilites from "../Utilities";
import * as FileSystem from "../FileSystem";
import * as UI from "../UI";
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
    static Load(id:string) : Void {
        if (fs.existsSync(path.join(FileSystem.StorageDataPath, "Voids", id + ".json")) == false) {
            throw Error("Void doesn't exist.");
        }
        return $.extend(true, new this(), JSON.parse(fs.readFileSync(path.join(FileSystem.StorageDataPath, "Voids", id + ".json")).toString()));
    }
    Save(){
        if (fs.existsSync(path.join(FileSystem.StorageDataPath, "Voids")) == false) {
            fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Voids"));
        }
        fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Voids", this.ID + ".json"), JSON.stringify(this));
    }
};
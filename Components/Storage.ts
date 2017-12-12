import * as $ from 'jquery';
import * as fs from 'fs';
import * as path from 'path';
import { FileSystem, UI, Storage } from "./Index";
import * as Utilities from "./Utilities";
import { Player, KnownServer, MessageCounter } from '../Models/Index';


export var Me = new Player();

export var ClientSettings = new class ClientSettings {
    AutoSaveIntervalSeconds: number = 300;
    Colors = {
        "GlobalChat": "seagreen",
        "VoidChat": "lightsteelblue",
        "Whisper": "magenta",
        "System": "lightgray",
        "Debug": "rgb(150,50,50)"
    }
    IsMultiplayerEnabled:boolean = false;
    IsDebugModeEnabled: boolean = false;
    IsNetworkBarVisible: boolean = true;
    TextInputAliases = {
        Command: "/c ",
        GlobalChat: "/g ",
        VoidChat: "/v ",
        Script: "/s "
    };
};

export var ServerSettings = new class ServerSettings {
    IsEnabled:boolean = false;
    IsPublic: boolean = true;
    ListeningPort: number = 48836;
    MessageCountMilliseconds: number = 60000;
    MessageCountLimit: number = 300;
    ServerID: string = Utilities.CreateGUID();
}

export var KnownServers: KnownServer[] = [
    new KnownServer("after.myddns.rocks", 48836, false)
];

export var Temp = new class Temp {
    JSONObjects: Array<any> = new Array<any>();
    MessageCounters: Array<MessageCounter> = new Array<MessageCounter>();
    ReceivedMessages: string[] = new Array<string>();
};

export function LoadAll() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(FileSystem.StorageDataPath);
    }
    fs.readdirSync(FileSystem.StorageDataPath).forEach(function (value) {
        if (fs.lstatSync(path.join(FileSystem.StorageDataPath, value)).isFile()){
            var itemName = value.replace(".json", "");
            var content = fs.readFileSync(path.join(FileSystem.StorageDataPath, value)).toString();
            var storage = JSON.parse(content);
            $.extend(Storage[itemName], JSON.parse(content));
        }
    });
};

export function SaveAll() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Storage"));
    }
    for (var item in Storage) {
        if (item == "Temp" || typeof this[item] == "function") {
            continue;
        }
        fs.writeFileSync(path.join(FileSystem.StorageDataPath, item + ".json"), JSON.stringify(Storage[item]));
    }
}

export function LoadMe(slot:string){
    var loadPath = "";
    if (slot == "0"){
        var loadPath = path.join(FileSystem.StorageDataPath, "Me.json");
    }
    else
    {
        var loadPath = path.join(FileSystem.StorageDataPath, "Character_Saves", slot + ".json");
    }
    if (fs.existsSync(loadPath) == false) {
        throw "Save file not found.";
    }
    var content = fs.readFileSync(loadPath).toString();
    $.extend(this.Me, JSON.parse(content));
}
export function SaveMe(slot:string) {
    fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Me.json"), JSON.stringify(this.Me));
    if (fs.existsSync(path.join(FileSystem.StorageDataPath, "Character_Saves")) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Character_Saves"));
    }
    fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Character_Saves", slot + ".json"), JSON.stringify(this.Me));
}
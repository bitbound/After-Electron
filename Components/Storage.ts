import * as $ from 'jquery';
import * as fs from 'fs';
import * as path from 'path';
import { FileSystem, UI, Storage } from "./All";
import * as Utilities from "./Utilities";
import { Player, KnownServer, MessageCounter } from '../Models/All';


export var Me = new Player();

export var ApplicationSettings = new class ApplicationSettings {
    AutoSaveIntervalSeconds: number = 300;
    Colors = {
        "GlobalChat": "seagreen",
        "VoidChat": "lightsteelblue",
        "Whisper": "magenta",
        "System": "lightgray",
        "Debug": "rgb(150,50,50)"
    }
    IsDebugModeEnabled: boolean = false;
    TextInputAliases = {
        Command: "/c ",
        GlobalChat: "/g ",
        VoidChat: "/v ",
        Script: "/s "
    };
};

export var ConnectionSettings = new class ConnectionSettings {
    IsClientEnabled:boolean = false;
    IsClientDiscoverable:boolean = true;
    IsServerEnabled:boolean = false;
    IsPublicServer: boolean = true;
    ServerListeningPort: number = 48836;
    ServerID: string = Utilities.CreateGUID();
    MessageCountMilliseconds: number = 60000;
    MessageCountLimit: number = 300;
    MaxConnectionAttempts:number = 10;
}

export var KnownServers: KnownServer[] = [
    new KnownServer("after.myddns.rocks", 48836, false),
    new KnownServer("after.myddns.rocks", 48837, false),
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
            $.extend(true, Storage[itemName], JSON.parse(content));
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
    $.extend(true, this.Me, JSON.parse(content));
}
export function SaveMe(slot:string) {
    fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Me.json"), JSON.stringify(this.Me));
    if (fs.existsSync(path.join(FileSystem.StorageDataPath, "Character_Saves")) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Character_Saves"));
    }
    fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Character_Saves", slot + ".json"), JSON.stringify(this.Me));
}
export function LoadSettings() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(FileSystem.StorageDataPath);
    }
    fs.readdirSync(FileSystem.StorageDataPath).forEach(function (value) {
        if (fs.lstatSync(path.join(FileSystem.StorageDataPath, value)).isFile()){
            var itemName = value.replace(".json", "");
            if (itemName != "Me") {
                var content = fs.readFileSync(path.join(FileSystem.StorageDataPath, value)).toString();
                $.extend(true, Storage[itemName], JSON.parse(content));
            }
        }
    });
};

export function SaveSettings() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Storage"));
    }
    for (var item in Storage) {
        if (item == "Temp" || item == "Me" || typeof this[item] == "function") {
            continue;
        }
        fs.writeFileSync(path.join(FileSystem.StorageDataPath, item + ".json"), JSON.stringify(Storage[item]));
    }
}

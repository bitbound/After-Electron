import * as $ from 'jquery';
import * as fs from 'fs';
import * as FileSystem from './FileSystem';
import * as Models from './Models';
import * as path from 'path';
import * as Storage from './Storage';
import * as UI from "./UI";
import * as Utilities from "./Utilities";

export var Me = new Models.Player();

export var ClientSettings = new class ClientSettings {
    Colors = {
        "GlobalChat": "seagreen",
        "VoidChat": "lightsteelblue",
        "Whisper": "magenta",
        "System": "lightgray"
    }
    TextInputAliases = {
        Command: "/c ",
        GlobalChat: "/g ",
        VoidChat: "/v ",
        Script: "/s "
    };
    IsMultiplayerEnabled:boolean = false;
};
export var ServerSettings = new class ServerSettings {
    IsEnabled:boolean = false;
    ListeningPort: number = 48836;
}
export var KnownServers: typeof Models.KnownServer.prototype[] = [
    new Models.KnownServer("after.myddns.rocks", 48836)
];

export var Temp = new class Temp {
    constructor(){
        this.InboundConnections = new Array();
        this.ReceivedMessages = new Array<string>();
    }
    ActiveTCPClientConnections: typeof Models.ConnectedClient.prototype[];
    InboundConnections: typeof Models.TCPClient.prototype[];
    PlayersInMyVoid: typeof Models.Player.prototype[];
    ReceivedMessages: string[];
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
    UI.RefreshUI();
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
    UI.RefreshUI();
}
export function SaveMe(slot:string) {
    fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Me.json"), JSON.stringify(this.Me));
    if (fs.existsSync(path.join(FileSystem.StorageDataPath, "Character_Saves")) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Character_Saves"));
    }
    fs.writeFileSync(path.join(FileSystem.StorageDataPath, "Character_Saves", slot + ".json"), JSON.stringify(this.Me));
}
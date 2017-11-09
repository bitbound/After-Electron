import * as $ from 'jquery';
import * as fs from 'fs';
import * as IO from './IO';
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
        "Whisper": "magenta"
    }
    TextInputAliases = {
        Command: "/c ",
        GlobalChat: "/g ",
        VoidChat: "/v ",
        Script: "/s "
    };
    TCPServerPort: number = 48836;
    MultiplayerEnabled:boolean = true;
    TCPServerEnabled:boolean = false;
};

export var KnownTCPServers: typeof Models.KnownTCPServer.prototype[] = [
    
];

export var Temp = new class Temp {
    constructor(){
        this.ActiveTCPClientConnections = new Array();
        this.PassiveTCPClientConnections = new Array();
        this.PlayersInMyVoid = new Array();
        this.ReceivedMessages = new Array<string>();
    }
    ActiveTCPClientConnections: typeof Models.ActiveTCPClient.prototype[];
    PassiveTCPClientConnections: typeof Models.PassiveTCPClient.prototype[];
    PlayersInMyVoid: typeof Models.Player.prototype[];
    ReceivedMessages: string[];
    HaveYouGotten(id:string){
        if (this.ReceivedMessages.find(item=>item == id)){
            return true;
        }
        else {
            this.ReceivedMessages.push(id);
            return false;
        }
    }
};

export var STUNServers = [
    "stun:stun.stunprotocol.org",
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302",
    "stun:stun3.l.google.com:19302",
    "stun:stun4.l.google.com:19302"
];


export function LoadAll() {
    if (fs.existsSync(IO.StorageDataPath) == false) {
        fs.mkdirSync(IO.StorageDataPath);
    }
    fs.readdirSync(IO.StorageDataPath).forEach(function (value) {
        if (fs.lstatSync(path.join(IO.StorageDataPath, value)).isFile()){
            var itemName = value.replace(".json", "");
            var content = fs.readFileSync(path.join(IO.StorageDataPath, value)).toString();
            var storage = JSON.parse(content);
            $.extend(Storage[itemName], JSON.parse(content));
        }
    });
    UI.RefreshUI();
};

export function SaveAll() {
    if (fs.existsSync(IO.StorageDataPath) == false) {
        fs.mkdirSync(path.join(IO.StorageDataPath, "Storage"));
    }
    for (var item in Storage) {
        if (item == "Temp" || typeof this[item] == "function") {
            continue;
        }
        fs.writeFileSync(path.join(IO.StorageDataPath, item + ".json"), JSON.stringify(Storage[item]));
    }
}

export function LoadMe(slot:string){
    var loadPath = "";
    if (slot == "0"){
        var loadPath = path.join(IO.StorageDataPath, "Me.json");
    }
    else
    {
        var loadPath = path.join(IO.StorageDataPath, "Character_Saves", slot + ".json");
    }
    if (fs.existsSync(loadPath) == false) {
        throw "Save file not found.";
    }
    var content = fs.readFileSync(loadPath).toString();
    $.extend(this.Me, JSON.parse(content));
    UI.RefreshUI();
}
export function SaveMe(slot:string) {
    fs.writeFileSync(path.join(IO.StorageDataPath, "Me.json"), JSON.stringify(this.Me));
    if (fs.existsSync(path.join(IO.StorageDataPath, "Character_Saves")) == false) {
        fs.mkdirSync(path.join(IO.StorageDataPath, "Character_Saves"));
    }
    fs.writeFileSync(path.join(IO.StorageDataPath, "Character_Saves", slot + ".json"), JSON.stringify(this.Me));
}
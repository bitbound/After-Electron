import * as $ from 'jquery';
import * as fs from 'fs';
import * as path from 'path';
import { FileSystem, UI, DataStore } from "./All";
import * as Utilities from "./Utilities";
import { Player, KnownServer, MessageCounter, GameSession } from '../Models/All';
import * as Models from "../Models/All";


export var Me = new Player();

export var ApplicationSettings = new Models.ApplicationSettings();

export var ConnectionSettings = new Models.ConnectionSettings();

export var KnownServers: KnownServer[] = [
    new KnownServer("after.myddns.rocks", 48836, false),
    new KnownServer("after.myddns.rocks", 48837, false),
];

export var BlockedServers: KnownServer[] = [
    
]

export var Temp = new class Temp {
    // Used for temporary storage for intellisense and other utility functions.
    JSONObjects: Array<any> = new Array<any>();
    // Used for throttling incoming messages.
    MessageCounters: Array<MessageCounter> = new Array<MessageCounter>();
    ReceivedMessages: string[] = new Array<string>();
    OutgoingServerReachTestID: string;
    IncomingServerReachTests: Array<string> = new Array<string>();
    ActiveGameSession: GameSession;
};

export function LoadAll() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(FileSystem.StorageDataPath);
    }
    fs.readdirSync(FileSystem.StorageDataPath).forEach(function (value) {
        if (fs.lstatSync(path.join(FileSystem.StorageDataPath, value)).isFile()){
            var itemName = value.replace(".json", "");
            var content = fs.readFileSync(path.join(FileSystem.StorageDataPath, value)).toString();
            // We want to replace arrays completely, not extend them.
            if (DataStore[itemName] instanceof Array){
                DataStore[itemName] = JSON.parse(content);
            } 
            else {
                $.extend(true, DataStore[itemName], JSON.parse(content));
            } 
        }
    });
};

export function SaveAll() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Storage"));
    }
    for (var item in DataStore) {
        if (item == "Temp" || typeof this[item] == "function") {
            continue;
        }
        fs.writeFileSync(path.join(FileSystem.StorageDataPath, item + ".json"), JSON.stringify(DataStore[item]));
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
                // We want to replace arrays completely, not extend them.
                if (DataStore[itemName] instanceof Array){
                    DataStore[itemName] = JSON.parse(content);
                } 
                else {
                    $.extend(true, DataStore[itemName], JSON.parse(content));
                } 
            }
        }
    });
};

export function SaveSettings() {
    if (fs.existsSync(FileSystem.StorageDataPath) == false) {
        fs.mkdirSync(path.join(FileSystem.StorageDataPath, "Storage"));
    }
    for (var item in DataStore) {
        if (item == "Temp" || item == "Me" || typeof this[item] == "function") {
            continue;
        }
        fs.writeFileSync(path.join(FileSystem.StorageDataPath, item + ".json"), JSON.stringify(DataStore[item]));
    }
}

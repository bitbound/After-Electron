import * as $ from 'jquery';
import * as fs from 'fs';
import * as IO from './IO';
import * as Models from './Models';
import * as path from 'path';
import * as Storage from './Storage';
import * as UI from "./UI";
import * as Utilities from "./Utilities";

export var Me = new class Me {
    ID: string;
    Name: string;
    Color: string;
    
    
    // Core Energy //
    private coreEnergy:number;
    get CoreEnergy():number{
        return this.coreEnergy;
    }
    set CoreEnergy(value:number){
        this.coreEnergy = value;
        if (value > this.CoreEnergyPeak){
            this.CoreEnergyPeak = value;
        }
    }
    CoreEnergyPeak: number;

    // Energy //
    private currentEnergy: number;
    get CurrentEnergy():number{
        return this.currentEnergy;
    }
    set CurrentEnergy(value:number){
        this.currentEnergy = value;
        $("#divEnergyAmount").text(Storage.Me.CurrentEnergy);
        $("#svgEnergy").css("width", String(Storage.Me.CurrentEnergy / Storage.Me.MaxEnergy * 100 || 0) + "%");
    }

    get MaxEnergy():number{
        return this.CoreEnergy + this.EnergyMod;
    }

    private energyMod: number;
    get EnergyMod():number {
        return this.energyMod;
    }
    set EnergyMod(value:number){
        this.energyMod = value;
        $("#divEnergyAmount").text(Storage.Me.CurrentEnergy);
        $("#svgEnergy").css("width", String(Storage.Me.CurrentEnergy / Storage.Me.MaxEnergy * 100 || 0) + "%");
    }

    // Charge //
    private currentCharge: number;
    get CurrentCharge(): number{
        return this.currentCharge;
    }
    set CurrentCharge(value:number){
        this.currentCharge = value;
        $("#divChargeAmount").text(Storage.Me.CurrentCharge);
        $("#svgCharge").css("width", String(Storage.Me.CurrentCharge / Storage.Me.MaxCharge * 100 || 0) + "%");
    }

    get MaxCharge(): number{
        return this.CoreEnergy + this.ChargeMod;
    }

    private chargeMod: number;
    get ChargeMod(): number {
        return this.chargeMod;
    }
    set ChargeMod(value:number){
        this.chargeMod = value;
        $("#divChargeAmount").text(Storage.Me.CurrentCharge);
        $("#svgCharge").css("width", String(Storage.Me.CurrentCharge / Storage.Me.MaxCharge * 100 || 0) + "%");
    }


    Load (slot:string){
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
        Utilities.CopyProperties(JSON.parse(content), Storage.Me);
    }
    Save(slot:string) {
        fs.writeFileSync(path.join(IO.StorageDataPath, "Me.json"), JSON.stringify(Storage.Me));

        if (fs.existsSync(path.join(IO.StorageDataPath, "Character_Saves")) == false) {
            fs.mkdirSync(path.join(IO.StorageDataPath, "Character_Saves"));
        }
        fs.writeFileSync(path.join(IO.StorageDataPath, "Character_Saves", slot + ".json"), JSON.stringify(Storage.Me));
    }
};

export var ClientSettings = new class ClientSettings {
    TCPServerPort: number = 48836;
};

export var KnownTCPServers: typeof Models.KnownTCPServer.prototype[] = [
    new Models.KnownTCPServer("127.0.0.1", ClientSettings.TCPServerPort)
];

export var Temp = new class Temp {
    constructor(){
        this.ActiveTCPClientConnections = new Array();
        this.PassiveTCPClientConnections = new Array();
        this.PlayersInMyVoid = new Array();
    }
    ActiveTCPClientConnections: typeof Models.ActiveTCPClient.prototype[];
    PassiveTCPClientConnections: typeof Models.PassiveTCPClient.prototype[];
    PlayersInMyVoid: typeof Models.Player.prototype[];
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
            Utilities.CopyProperties(JSON.parse(content), Storage[itemName]);
        }
    });
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
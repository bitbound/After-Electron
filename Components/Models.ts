import * as net from "net";
import * as fs from "fs";
import * as IO from "./IO";
import * as path from "path";

export var Void = class Void {
    ID:string;
    Title:string;
    Description:string;
    Owner: string;
    NPCs: typeof NPC.prototype[];
    static Load(id:string){
        if (fs.existsSync(path.join(IO.StorageDataPath, "Voids", id + ".json")) == false) {
            throw Error("Void doesn't exist.");
        }
        $.extend(true, this, fs.readFileSync(path.join(IO.StorageDataPath, "Voids", id + ".json")).toJSON());
    }
    Save(){
        if (fs.existsSync(path.join(IO.StorageDataPath, "Voids")) == false) {
            fs.mkdirSync(path.join(IO.StorageDataPath, "Voids"));
        }
        fs.writeFileSync(path.join(IO.StorageDataPath, "Voids", this.ID + ".json"), JSON.stringify(this));
    }

};

export var NPC = class NPC {
    ID:string;
    Name:string;
};

export var Player = class Player {
    constructor(){
        this.CoreEnergy = 100;
        this.CoreEnergyPeak = 100;
        this.CurrentEnergy = 0;
        this.EnergyMod = 0;
        this.CurrentCharge = 0;
        this.ChargeMod = 0;
    }
    ID: string;
    Name: string;
    Color: string;
    InnerVoidID: string;
    
    // Core Energy //
    CoreEnergy: number;
    CoreEnergyPeak: number;

    // Energy //
    CurrentEnergy:number;
    EnergyMod:number;
    get MaxEnergy():number{
        return this.CoreEnergy + this.EnergyMod;
    }

    // Charge //
    CurrentCharge:number;
    ChargeMod:number;
    get MaxCharge(): number{
        return this.CoreEnergy + this.ChargeMod;
    }
};

export var OutboundConnection = class OutboundConnection {
    Socket: NodeJS.Socket;
    Server: typeof KnownTCPServer;
}

export var ActiveTCPClient = class ActiveTCPClient {
    Socket: NodeJS.Socket;
    Player: typeof Player;
};
export var PassiveTCPClient = class PassiveTCPClient {
    Socket: NodeJS.Socket;
    ID: string;
};
export var KnownTCPServer = class KnownTCPServer {
    constructor(ip:string, port:number){
        this.IP = ip;
        this.Port = port;
    }
    IP:string;
    Port:number;
    BadConnectionAttempts:number;
}
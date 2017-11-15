import * as net from "net";
import * as fs from "fs";
import * as FileSystem from "./FileSystem";
import * as path from "path";
import * as UI from "./UI";
import * as Models from "./Models";
import * as Connectivity from "./Connectivity";
import * as Storage from "./Storage";
import * as SocketDataIO from "./SocketDataIO";
import * as Utilities from "./Utilities";
import * as $ from "jquery";


export class ActiveTCPClient {
    Socket: NodeJS.Socket;
    ID: string;
    Player: typeof Player.prototype;
};
export enum ConnectionTypes{
    ActiveClient,
    PassiveClient,
    ServerToServer
}
export class KnownTCPServer {
    constructor(ip:string, port:number){
        this.IP = ip;
        this.Port = port;
    }
    IP:string;
    Port:number;
    BadConnectionAttempts:number = 0;
}
export class LocalTCPServer {
    TCPServer: net.Server;
    IsShutdownExpected: boolean = false;
    ID: string = Utilities.CreateGUID();
    IsListening():boolean{
        if (this.TCPServer != null && this.TCPServer.listening){
            return true;
        }
        else {
            return false;
        }
    }
}
export class NPC {
    ID:string;
    Name:string;
    IsAgressive: boolean;
};
export class OutboundConnection {
    ActiveServerID: string;
    ConnectionType: ConnectionTypes;
    IsDisconnectExpected: boolean = false;
    Socket: NodeJS.Socket;
    Server: typeof KnownTCPServer.prototype;
    IsConnected():boolean{
        if (this.Socket == null || this.Socket.writable == false){
            return false;
        }
        else {
            return true;
        }
    }
}

export class PassiveTCPClient {
    Socket: NodeJS.Socket;
    ID: string;
};

export class Player {
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
    ReadyState: ReadyStates;
  
    // Core Energy //
    CoreEnergy: number;
    CoreEnergyPeak: number;

    // Energy //
    CurrentEnergy:number;
    EnergyMod:number;

    get MaxEnergy():number {
        return this.CoreEnergy + this.EnergyMod;
    }

    // Charge //
    CurrentCharge:number;
    ChargeMod:number;
    get MaxCharge(): number{
        return this.CoreEnergy + this.ChargeMod;
    }
};
export enum ReadyStates {
    OK,
    Charging
}
export class Void {
    Color: string;
    Description:string;
    ID:string;
    IsDestructible: boolean;
    IsInnerVoid: boolean;
    NPCs: typeof NPC.prototype[];
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
    static Load(id:string) : typeof Void.prototype {
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
import * as net from "net";

export var Void = class Void {
    ID:string;
    Title:string;
    Description:string;
};

export var NPC = class NPC {
    ID:string;
    Name:string;
};

export var Player = class Player {
    ID:string;
    Name:string;
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
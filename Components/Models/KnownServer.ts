export class KnownServer {
    constructor(ip:string, port:number){
        this.Host = ip;
        this.Port = port;
    }
    Host:string;
    Port:number;
    BadConnectionAttempts:number = 0;
    ID: string;
}

export class KnownServer {
    constructor(ip:string, port:number, isLocalNetwork:boolean){
        this.Host = ip;
        this.Port = port;
        this.IsLocalNetwork = isLocalNetwork;
    }
    Host:string;
    Port:number;
    BadConnectionAttempts:number = 0;
    ID: string;
    IsLocalNetwork: boolean;
}

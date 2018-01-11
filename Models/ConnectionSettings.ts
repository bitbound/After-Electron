import { Utilities } from "../Components/All";

export class ConnectionSettings {
    IsClientEnabled:boolean = false;
    IsClientDiscoverable:boolean = true;
    IsServerEnabled:boolean = false;
    IsNetworkSupport: boolean = true;
    ServerListeningPort: number = 48836;
    ServerID: string = Utilities.CreateGUID();
    MessageCountMilliseconds: number = 60000;
    MessageCountLimit: number = 300;
    MaxConnectionAttempts:number = 10;
}

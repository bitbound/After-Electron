import { ReadyStates } from "./ReadyStates";

export class Player {
    Color: string;
    CurrentLocationID:string;
    ID: string;
    Name: string;
    InnerVoidID: string;
    ReadyState: ReadyStates;
  
    // Core Energy //
    CoreEnergy: number = 0;
    CoreEnergyPeak: number = 0;

    // Energy //
    CurrentEnergy:number = 0;
    EnergyMod:number = 0;
    MaxEnergy:number = 0;

    // Charge //
    CurrentCharge:number = 0;
    ChargeMod:number = 0;
    MaxCharge:number = 0;
};

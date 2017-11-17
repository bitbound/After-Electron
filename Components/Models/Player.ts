import { ReadyStates } from "./ReadyStates";

export class Player {
    constructor(){
        this.CoreEnergy = 100;
        this.CoreEnergyPeak = 100;
        this.CurrentEnergy = 0;
        this.EnergyMod = 0;
        this.CurrentCharge = 0;
        this.ChargeMod = 0;
    }
    Color: string;
    CurrentLocationID:string;
    ID: string;
    Name: string;
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

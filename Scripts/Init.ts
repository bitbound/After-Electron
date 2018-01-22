import * as After from "../Exports";
import * as electron from "electron";
import * as $ from "jquery";
import { Utilities, DataStore, UIEventHandler, UI } from "../Components/All";
import * as Splash from "../Scripts/Splash"

export function Start(){
    window.onerror = function(messageOrEvent, source, lineno, colno, error) {
        Utilities.Log(JSON.stringify(error));
    }
    window["After"] = After;
    window["$"] = $;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        DataStore.SaveAll();
    });
    electron.ipcRenderer.on("options-update", (event, args)=>{
        DataStore.LoadSettings();
    });
    UIEventHandler.ApplyUIEventHandlers();
    setUIDatabinds();
    DataStore.LoadAll();
    window.setInterval(()=>{
        DataStore.SaveAll();
        // Remove old message counters.
        var messageCounts = DataStore.Temp.MessageCounters;
        for (var i = messageCounts.length - 1; i >= 0; i--){
            if (messageCounts[i].MessageTimes.every(x=>Date.now() - x > 300000)){
                messageCounts.splice(i, 1);
            }
        }
    }, DataStore.ApplicationSettings.AutoSaveIntervalSeconds * 1000);
    Splash.Start();
}


function setUIDatabinds() {
    Utilities.DataBindOneWay(DataStore.Me, "CoreEnergy", null, null, function () {
        if (DataStore.Me.CoreEnergy > DataStore.Me.CoreEnergyPeak) {
            DataStore.Me.CoreEnergyPeak = DataStore.Me.CoreEnergy;
        }
        DataStore.Me.MaxEnergy = DataStore.Me.CoreEnergy + DataStore.Me.EnergyMod;
        DataStore.Me.MaxCharge = DataStore.Me.CoreEnergy + DataStore.Me.ChargeMod;
        $("#coreEnergySideMenu").text(DataStore.Me.CoreEnergy);
        $("#peakCoreEnergySideMenu").text(DataStore.Me.CoreEnergyPeak);
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "CoreEnergyPeak", null, null, function () {
        $("#peakCoreEnergySideMenu").text(DataStore.Me.CoreEnergyPeak);
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "CurrentEnergy", null, null, function () {
        $("#divEnergyAmount").text(DataStore.Me.CurrentEnergy);
        $("#currentEnergySideMenu").text(DataStore.Me.CurrentEnergy);
        $("#svgEnergy").css("width", String(Math.min(DataStore.Me.CurrentEnergy / DataStore.Me.MaxEnergy * 100, 100) || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "EnergyMod", null, null, function () {
        DataStore.Me.MaxEnergy = DataStore.Me.CoreEnergy + DataStore.Me.EnergyMod;
        $("#energyModSideMenu").text(DataStore.Me.EnergyMod);
        $("#maxEnergySideMenu").text(DataStore.Me.MaxEnergy);
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "MaxEnergy", null, null, function () {
        $("#maxEnergySideMenu").text(DataStore.Me.MaxEnergy);
        $("#svgEnergy").css("width", String(Math.min(DataStore.Me.CurrentEnergy / DataStore.Me.MaxEnergy * 100, 100) || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "CurrentCharge", null, null, function () {
        $("#divChargeAmount").text(DataStore.Me.CurrentCharge);
        $("#currentChargeSideMenu").text(DataStore.Me.CurrentCharge);
        $("#svgCharge").css("width", String(Math.min(DataStore.Me.CurrentCharge / DataStore.Me.MaxCharge * 100, 100) || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "ChargeMod", null, null, function () {
        DataStore.Me.MaxCharge = DataStore.Me.CoreEnergy + DataStore.Me.ChargeMod;
        $("#chargeModSideMenu").text(DataStore.Me.ChargeMod);
        $("#maxChargeSideMenu").text(DataStore.Me.MaxCharge);
    }, null);
    Utilities.DataBindOneWay(DataStore.Me, "MaxCharge", null, null, function () {
        $("#maxChargeSideMenu").text(DataStore.Me.MaxCharge);
        $("#svgCharge").css("width", String(Math.min(DataStore.Me.CurrentCharge / DataStore.Me.MaxCharge * 100, 100) || 0) + "%");
    }, null);
    Utilities.DataBindOneWay(DataStore.ApplicationSettings, "IsNetworkStatusBarVisible", null, null, () => {
        if (DataStore.ApplicationSettings.IsNetworkStatusBarVisible) {
            $("#statusFrame").show();
        }
        else {
            $("#statusFrame").hide();
        }
        UI.AdjustMessageWindowHeight();
    }, null);
}
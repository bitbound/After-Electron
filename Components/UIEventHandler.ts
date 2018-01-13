import * as electron from "electron";
import { UI, InputProcessor, Intellisense, DataStore, Connectivity } from "./All";

export function ApplyUIEventHandlers(){
    $("#gridDivider").on("pointerdown", (e)=>{
        var initialWidth = $("#menuFrame").width();
        var initialX = e.screenX;
        $(window).on("pointermove", (e)=>{
            e.preventDefault();
            $("#menuFrame").width(initialWidth + initialX - e.screenX)
        });
        $(window).on("pointerup", (e)=>{
            $(window).off("pointermove");
            $(window).off("pointerup");
        });
    });
    $("#menuButton").on("click", (e)=>{
        $("#gridDivider").css({
            "width": "3px",
            "margin-right": "5px"
        });
        $("#menuButton").hide();
        $("#menuFrame").animate({
            width: "200px"
        })
    });
    $("#optionsButton").on("click", (e)=>{
        DataStore.SaveAll();
        electron.ipcRenderer.send("options-menu");
    });
    $("#closeMenuButton").on("click", (e)=>{
        $("#menuFrame").animate({
            width: "0px"
        }, ()=>{
            $("#gridDivider").css({
                "width": "0px",
                "margin-right": "0px"
            });
            $("#menuButton").show();
        })
    });
    $("#menuFrame .side-menu-tab").click((e)=>{
        $(e.currentTarget).next().slideToggle();
    })
    UI.InputBox.on("keydown", (e) => {
        if (e.key.toLowerCase() == "arrowup"){
            e.preventDefault();
            InputProcessor.GetPreviousInput();
        }
        else if (e.key.toLowerCase() == "arrowdown"){
            e.preventDefault();
            InputProcessor.GetNextInput();
        }
        else if (e.key.toLowerCase() == "tab" && UI.InputModeSelector.val() == "Script"){
            e.preventDefault();
            Intellisense.AutoComplete();
        }
    })
    UI.InputBox.on("keypress", (e) =>{
        if (e.key.toLowerCase() == "enter"){
            InputProcessor.ProcessInput();
        }
    });
    
    // Check aliases.
    UI.InputBox.on("input", (e)=>{
        var inputModeAlises = Object.keys(DataStore.ApplicationSettings.InputModeAliases);
        for (var mode in DataStore.ApplicationSettings.InputModeAliases){
            if (UI.InputBox.val().toString().toLowerCase() == DataStore.ApplicationSettings.InputModeAliases[mode].toLowerCase()){
                (UI.InputModeSelector[0] as HTMLSelectElement).value = mode;
                UI.InputBox.val("");
            }
        }
        if (UI.InputModeSelector.val() == "Script") {
            Intellisense.EvaluateScript();
        }
        else if (UI.InputModeSelector.val() == "Command")
        {
            Intellisense.EvaluateCommand();
        }
    });

    $("#reconnectButton").on("click", async (e)=>{
        (e.currentTarget as HTMLButtonElement).disabled = true;
        await Connectivity.RefreshConnections();
        (e.currentTarget as HTMLButtonElement).disabled = false;
    });
};
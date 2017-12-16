import * as electron from "electron";
import { UI, InputProcessor, Intellisense, Storage } from "./All";

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
        Storage.SaveAll();
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
        if (UI.InputBox.val().toString().toLowerCase() == Storage.ApplicationSettings.TextInputAliases.Command.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Command";
            UI.InputBox.val("");
        }
        else if (UI.InputBox.val().toString().toLowerCase() == Storage.ApplicationSettings.TextInputAliases.GlobalChat.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Global Chat";
            UI.InputBox.val("");
        }
        else if (UI.InputBox.val().toString().toLowerCase() == Storage.ApplicationSettings.TextInputAliases.VoidChat.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Void Chat";
            UI.InputBox.val("");
        }
        else if (UI.InputBox.val().toString().toLowerCase() == Storage.ApplicationSettings.TextInputAliases.Script.toLowerCase()) {
            (UI.InputModeSelector[0] as HTMLSelectElement).value = "Script";
            UI.InputBox.val("");
        }
        if (UI.InputModeSelector.val() == "Script") {
            Intellisense.EvaluateScript();
        }
        else if (UI.InputModeSelector.val() == "Command")
        {
            Intellisense.EvaluateCommand();
        }
    });
};
import * as After from "../After";
import * as $ from "jquery";
import * as electron from "electron";
import * as Game from "./Game";
import * as Intro from "./Intro";

export function Init(){
    window["After"] = After;
    window["$"] = $;
    electron.remote.getCurrentWindow().on("close", (event)=>{
        After.Storage.SaveAll();
    });
    After.Storage.LoadAll();
    window.setInterval(()=>{
        After.Storage.SaveAll();
    }, After.Storage.ClientSettings.AutoSaveIntervalSeconds * 1000);
    function raiseParticle() {
        try {
            var rectTunnel = document.getElementById("imgTunnel").getBoundingClientRect();
            var riseHeight = $("#imgTunnel").height() * .8;
            var randomLeft = Math.random() * ($("#imgTunnel").width() * .20) + ($("#imgTunnel").width() * .25);
            var startLeft = Math.round(randomLeft + rectTunnel.left);
            var startTop = Math.round(rectTunnel.top + $("#imgTunnel").height() * .45);
            var part = document.createElement("div");
            $(part).css({
                height: "1px",
                width: "1px",
                left: startLeft,
                top: startTop,
                "border-radius": "100%",
                position: "absolute",
                "background-color": "black"
            });
            $("#divSplash").append(part);
            $(part).animate({
                height: "6px",
                width: "6px",
                "top": "-=" + riseHeight,
                "opacity": "0",
                "background-color": "gray"
            }, 3000, function () {
                $(part).remove();
            });
            window.setTimeout(function () {
                if ($("#divSplash").length > 0) {
                    raiseParticle();
                }
            }, 100);
        }
        catch (ex) { }
    }
    
    $(document).ready(function(){
        $("#buttonPlay").click(function () {
            var path = require("path");
            $("#divSplash").remove();
            $("#divGame").show();
            After.UI.InputBox.focus();
            After.UI.AdjustMessageWindowHeight();
            
            if (typeof After.Storage.Me.ID == "undefined"){
                Intro.Init();
            }
            else {
                Game.Init();
            }
        });
        $("#buttonOptions").click(function () {
            electron.remote.dialog.showMessageBox({
                "message": "Nothing to show yet.",
                "title": "In Progress"
            });
        });
        After.UI.ApplyEventHandlers();
        $("#divSplash").fadeIn(600);
        raiseParticle();
    })
}
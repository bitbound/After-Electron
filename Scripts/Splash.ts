import * as After from "../Exports";
import * as $ from "jquery";
import * as electron from "electron";
import * as Game from "./Game";
import * as Intro from "./Intro";
import { UI, DataStore } from "../Components/All";
import * as url from "url";
import * as path from "path";

export function Start(){
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
            UI.InputBox.focus();
            UI.AdjustMessageWindowHeight();
            
            if (typeof DataStore.Me.ID != "string"){
                Intro.Start();
            }
            else {
                Game.Start();
            }
        });
        $("#buttonOptions").click(function () {
            DataStore.SaveAll();
            electron.ipcRenderer.send("options-menu");
        });
        $("#divSplash").fadeIn(600);
        raiseParticle();
    })
}
import * as StorageData from "../Components/Storage"
import * as $ from "jquery";
import { Utilities } from "../Components/All";
import * as electron from "electron";
import * as fs from "fs";

export { StorageData };

$(document).ready(function () {
    window["$"] = $;
    window["StorageData"] = StorageData;
    electron.remote.getCurrentWindow().on("close", (event) => {
        StorageData.SaveSettings();
        electron.ipcRenderer.send("options-update");
    });

    Utilities.SetAllDatabinds(() => { StorageData.SaveSettings() });
    StorageData.LoadSettings();


    $(".options-side-tab").on("click", event => {
        switchContentFrame(event);
    });

    $(".color-wheel-button").on("click", (elem) => {
        $("#colorPopup").remove();
        var input = $(elem).next();
        var popup = document.createElement("div");
        popup.id = "colorPopup";
        popup.classList.add("popup-large");
        $(popup).html(fs.readFileSync(electron.remote.app.getAppPath() + "/HTML/Color_Picker.html").toString());
        document.body.appendChild(popup);
        eval($(popup).find("script").text());
        var relatedInput = $(elem.currentTarget).next();
        var dataProperty = relatedInput.attr("data-object") + "." + relatedInput.attr("data-property");
        $(popup).find("#divBrushPreview").css("background-color", relatedInput.val().toString());
        $(popup).find("#setColorButton").on("click", (event)=>{
            relatedInput.val($(popup).find("#divBrushPreview").css("background-color"));
            $(relatedInput).change();
            $(popup).remove();
        })
    })
    $("#knownServerButtons .fa-arrow-up").on("click", () => {
        var serverPort = $("#knownServerList").val().toString().split(":");
        var match = StorageData.KnownServers.find((x)=>{
            return x.Host == serverPort[0] && x.Port == parseInt(serverPort[1]);
        });
        if (match){
            var index = StorageData.KnownServers.indexOf(match);
            StorageData.KnownServers.splice(index, 1);
            StorageData.KnownServers.splice(index - 1, 0, match);
            populateKnownServers();
            ($("#knownServerList")[0] as HTMLSelectElement).selectedIndex = index - 1;
        }
    })
    $("#knownServerButtons .fa-arrow-down").on("click", ()=>{
        var serverPort = $("#knownServerList").val().toString().split(":");
        var match = StorageData.KnownServers.find((x)=>{
            return x.Host == serverPort[0] && x.Port == parseInt(serverPort[1]);
        });
        if (match){
            var index = StorageData.KnownServers.indexOf(match);
            StorageData.KnownServers.splice(index, 1);
            StorageData.KnownServers.splice(index + 1, 0, match);
            populateKnownServers();
            ($("#knownServerList")[0] as HTMLSelectElement).selectedIndex = index + 1;
        }
    })
    $("#knownServerButtons .fa-plus").on("click", ()=>{
        $('.popup-small').remove();
        var popup = document.createElement("div");
        popup.classList.add("popup-small");
        popup.innerHTML= `<div style="text-align: center;">
                            <div style="text-align: left; display:inline-block">
                                <h2>Add Server</h2>
                                Host:<br>
                                <input id="newHost" style="width:150px" /><br>
                                <br>
                                Port:<br>
                                <input id="newPort" style="width:150px" /><br>
                                <br>
                                <button style="width: 60px; height: 40px;" onclick="(function(){
                                    StorageData.KnownServers.push({'Host': $('#newHost').val(), 'Port': $('#newPort').val()});
                                    $('.popup-small').remove();
                                    window['Options'].populateKnownServers();
                                })()">Save</button>
                                <button style="width: 60px; height: 40px;" onclick="$('.popup-small').remove()">Cancel</button>
                            </div>
                        </div>`;
        document.body.appendChild(popup);
    })
    $("#knownServerButtons .fa-trash").on("click", ()=>{
        var serverPort = $("#knownServerList").val().toString().split(":");
        var index = StorageData.KnownServers.findIndex((x)=>{
            return x.Host == serverPort[0] && x.Port == serverPort[1] as any;
        });
        if (index > -1){
            StorageData.KnownServers.splice(index, 1);
            populateKnownServers();
        }
     })
     $("#blockedServerButtons .fa-plus").on("click", ()=>{
        $('.popup-small').remove();
        var popup = document.createElement("div");
        popup.classList.add("popup-small");
        popup.innerHTML= `<div style="text-align: center;">
                            <div style="text-align: left; display:inline-block">
                                <h2>Block Server</h2>
                                Host:<br>
                                <input id="newHost" style="width:150px" /><br>
                                <br>
                                Port:<br>
                                <input id="newPort" style="width:150px" /><br>
                                <br>
                                <button style="width: 60px; height: 40px;" onclick="(function(){
                                    StorageData.BlockedServers.push({'Host': $('#newHost').val(), 'Port': $('#newPort').val()});
                                    $('.popup-small').remove();
                                    window['Options'].populateBlockedServers();
                                })()">Save</button>
                                <button style="width: 60px; height: 40px;" onclick="$('.popup-small').remove()">Cancel</button>
                            </div>
                        </div>`;
        document.body.appendChild(popup);
    })
    $("#blockedServerButtons .fa-trash").on("click", ()=>{
        var serverPort = $("#blockedServerList").val().toString().split(":");
        var index = StorageData.BlockedServers.findIndex((x)=>{
            return x.Host == serverPort[0] && x.Port == serverPort[1] as any;
        });
        if (index > -1){
            StorageData.BlockedServers.splice(index, 1);
            populateBlockedServers();
        }
     })
    populateKnownServers();
    populateBlockedServers();
})


function switchContentFrame(e) {
    var clickedTab = e.currentTarget;
    $(".options-content").hide();
    $(".options-side-tab").removeClass("selected");
    $(clickedTab).addClass("selected");
    var targetID = clickedTab.innerHTML.trim().toLowerCase() + "Options";
    $("#" + targetID).fadeIn(200);
}

export function populateKnownServers(){
    var selectKnown = $("#knownServerList")[0] as HTMLSelectElement;
    selectKnown.innerHTML = "";
    for (var i = 0; i < StorageData.KnownServers.length; i++){
        var server =  StorageData.KnownServers[i];
        var option = document.createElement("option");
        option.value = `${server.Host}:${server.Port}`;
        option.innerHTML = `${server.Host}:${server.Port}`;
        option.title = `Host: ${server.Host}\r\n`;
        option.title += `Port: ${server.Port}\r\n`;
        option.title += `ID: ${server.ID}\r\n`;
        option.title += `Bad Connection Attempts: ${server.BadConnectionAttempts}\r\n`;
        option.title += `Is Local: ${server.IsLocalNetwork}`;
        selectKnown.options.add(option);
    }
}

export function populateBlockedServers(){
    var blockedServers = $("#blockedServerList")[0] as HTMLSelectElement;
    blockedServers.innerHTML = "";
    for (var i = 0; i < StorageData.BlockedServers.length; i++){
        var server =  StorageData.BlockedServers[i];
        var option = document.createElement("option");
        option.value = `${server.Host}:${server.Port}`;
        option.innerHTML = `${server.Host}:${server.Port}`;
        option.title = `Host: ${server.Host}\r\n`;
        option.title += `Port: ${server.Port}\r\n`;
        option.title += `ID: ${server.ID}\r\n`;
        option.title += `Bad Connection Attempts: ${server.BadConnectionAttempts}\r\n`;
        option.title += `Is Local: ${server.IsLocalNetwork}`;
        blockedServers.options.add(option);
    }
}
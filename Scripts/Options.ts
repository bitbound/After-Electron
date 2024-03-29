import * as DataStore from "../Components/DataStore"
import * as $ from "jquery";
import { Utilities } from "../Components/All";
import * as electron from "electron";
import * as fs from "fs";
import { MessageBoxOptions } from "electron";

export { DataStore };

export function Init() {
    $(document).ready(function () {
        window["$"] = $;
        window["DataStore"] = DataStore;
        // This is here to allow ColorPicker access to Utilities.
        window["Utilities"] = Utilities;
        electron.remote.getCurrentWindow().on("close", (event) => {
            DataStore.SaveSettings();
            electron.ipcRenderer.send("options-update");
        });

        Utilities.SetAllDatabinds(() => {
            DataStore.SaveSettings();
            electron.ipcRenderer.send("options-update");
        });
        DataStore.LoadSettings();

        $("#helpImg").on("click", (e)=>{
            var options = {
                title: "Options Info",
                message: "Many options have tooltips that explain their purpose.  If you're unsure about an option, don't forget to try hovering over it!",
                icon: electron.remote.nativeImage.createFromPath(electron.remote.app.getAppPath() + "/Assets/help.png")
            } as electron.MessageBoxOptions;
            
            electron.remote.dialog.showMessageBox(options);
        })

        $(".options-side-tab").on("click", event => {
            switchContentFrame(event);
        });

        $(".color-wheel-button").on("click", (elem) => {
            $("#colorPopup").remove();
            var popup = document.createElement("div");
            popup.id = "colorPopup";
            popup.classList.add("popup-large");
            $(popup).html(fs.readFileSync(electron.remote.app.getAppPath() + "/HTML/Color_Picker.html").toString());
            document.body.appendChild(popup);
            eval($(popup).find("script").text());
            var relatedInput = $(elem.currentTarget).next();
            var currentValue = relatedInput.val() as string;
            if (currentValue.trim().length > 0) {
                if (currentValue.search("rgb") > -1) {
                    var values = currentValue.replace("rgb(", "").replace(")", "").trim().split(",");
                    $("#inputBrushRed").val(values[0].trim());
                    $("#inputBrushGreen").val(values[1].trim());
                    $("#inputBrushBlue").val(values[2].trim());
                }
                else {
                    var index = $("#selectColor").children().filter((index, element) => {
                        return element.innerText.trim().toLowerCase() == currentValue.trim().toLowerCase();
                    }).index();
                    ($("#selectColor")[0] as HTMLSelectElement).selectedIndex = index;
                }
            }
            $(popup).find("#divBrushPreview").css("background-color", relatedInput.val().toString());
            $(popup).find("#setColorButton").on("click", (event) => {
                relatedInput.val($(popup).find("#divBrushPreview").css("background-color"));
                $(relatedInput).change();
                $(popup).remove();
            })
        })
        $("#knownServerButtons .fa-arrow-up").on("click", () => {
            var serverPort = $("#knownServerList").val().toString().split(":");
            var match = DataStore.KnownServers.find((x) => {
                return x.Host == serverPort[0] && x.Port == parseInt(serverPort[1]);
            });
            if (match) {
                var index = DataStore.KnownServers.indexOf(match);
                if (index > 0) {
                    DataStore.KnownServers.splice(index, 1);
                    DataStore.KnownServers.splice(index - 1, 0, match);
                    populateKnownServers();
                    ($("#knownServerList")[0] as HTMLSelectElement).selectedIndex = index - 1;
                }
            }
        })
        $("#knownServerButtons .fa-arrow-down").on("click", () => {
            var serverPort = $("#knownServerList").val().toString().split(":");
            var match = DataStore.KnownServers.find((x) => {
                return x.Host == serverPort[0] && x.Port == parseInt(serverPort[1]);
            });
            if (match) {
                var index = DataStore.KnownServers.indexOf(match);
                DataStore.KnownServers.splice(index, 1);
                DataStore.KnownServers.splice(index + 1, 0, match);
                populateKnownServers();
                ($("#knownServerList")[0] as HTMLSelectElement).selectedIndex = index + 1;
            }
        })
        $("#knownServerButtons .fa-plus").on("click", () => {
            $('.popup-small').remove();
            var popup = document.createElement("div");
            popup.classList.add("popup-small");
            popup.innerHTML = `<div style="text-align: center;">
                                <div style="text-align: left; display:inline-block">
                                    <h2>Add Server</h2>
                                    Host:<br>
                                    <input id="newHost" style="width:150px" /><br>
                                    <br>
                                    Port:<br>
                                    <input id="newPort" style="width:150px" /><br>
                                    <label title="Whether this host is on the local network and shouldn't be shared online." for="isLocalCheckbox">Is Local:</label>
                                    <input id="isLocalCheckbox" type="checkbox" /> <br>
                                    <br>
                                    <button style="width: 60px; height: 40px;" onclick="(function(){
                                        DataStore.KnownServers.push({'Host': $('#newHost').val(), 'Port': $('#newPort').val(), 'IsLocalNetwork': $('#isLocalCheckbox')[0].checked });
                                        $('.popup-small').remove();
                                        window['Options'].populateKnownServers();
                                    })()">Save</button>
                                    <button style="width: 60px; height: 40px;" onclick="$('.popup-small').remove()">Cancel</button>
                                </div>
                            </div>`;
            document.body.appendChild(popup);
        })
        $("#knownServerButtons .fa-trash").on("click", () => {
            var serverPort = $("#knownServerList").val().toString().split(":");
            var index = DataStore.KnownServers.findIndex((x) => {
                return x.Host == serverPort[0] && x.Port == serverPort[1] as any;
            });
            if (index > -1) {
                DataStore.KnownServers.splice(index, 1);
                populateKnownServers();
            }
        })
        $("#blockedServerButtons .fa-plus").on("click", () => {
            $('.popup-small').remove();
            var popup = document.createElement("div");
            popup.classList.add("popup-small");
            popup.innerHTML = `<div style="text-align: center;">
                                <div style="text-align: left; display:inline-block">
                                    <h2>Block Server</h2>
                                    Host:<br>
                                    <input id="newHost" style="width:150px" /><br>
                                    <br>
                                    Port:<br>
                                    <input id="newPort" style="width:150px" /><br>
                                    <br>
                                    <button style="width: 60px; height: 40px;" onclick="(function(){
                                        DataStore.BlockedServers.push({'Host': $('#newHost').val(), 'Port': $('#newPort').val()});
                                        $('.popup-small').remove();
                                        window['Options'].populateBlockedServers();
                                    })()">Save</button>
                                    <button style="width: 60px; height: 40px;" onclick="$('.popup-small').remove()">Cancel</button>
                                </div>
                            </div>`;
            document.body.appendChild(popup);
        })
        $("#blockedServerButtons .fa-trash").on("click", () => {
            var serverPort = $("#blockedServerList").val().toString().split(":");
            var index = DataStore.BlockedServers.findIndex((x) => {
                return x.Host == serverPort[0] && x.Port == serverPort[1] as any;
            });
            if (index > -1) {
                DataStore.BlockedServers.splice(index, 1);
                populateBlockedServers();
            }
        })
        populateKnownServers();
        populateBlockedServers();
    })
}

function switchContentFrame(e) {
    var clickedTab = e.currentTarget;
    $(".options-content").hide();
    $(".options-side-tab").removeClass("selected");
    $(clickedTab).addClass("selected");
    var targetID = clickedTab.innerHTML.trim().toLowerCase() + "Options";
    $("#" + targetID).fadeIn(200);
}

function populateKnownServers() {
    var selectKnown = $("#knownServerList")[0] as HTMLSelectElement;
    selectKnown.innerHTML = "";
    for (var i = 0; i < DataStore.KnownServers.length; i++) {
        var server = DataStore.KnownServers[i];
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

function populateBlockedServers() {
    var blockedServers = $("#blockedServerList")[0] as HTMLSelectElement;
    blockedServers.innerHTML = "";
    for (var i = 0; i < DataStore.BlockedServers.length; i++) {
        var server = DataStore.BlockedServers[i];
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
window['Options'] = {
    populateKnownServers: populateKnownServers,
    populateBlockedServers: populateBlockedServers
}
import * as After from "../Exports";
import * as $ from "jquery";
import * as Audio from "../Components/Audio";
import { UI, InputProcessor, DataStore, Utilities } from "../Components/All";

var skipIntro = false;

export var Start = function () {
    Audio.PlayLoop("../Assets/ceich93__drone-darkemptiness.mp3", null);

    var introText = [
        "You died.",
        "Slowly, your consciousness becomes aware of itself.",
        "You still exist, yet you are nothing.  You are nowhere.  All that remains is an awareness.",
        "The nothingness around you starts to react to your thoughts, to your will.",
        "You command this small pocket of emptiness.",
        "This is your inner void.",
        "You sense others.  They are neither near nor far.  Distance is irrelevant here.",
        "It's time to set out and discover what comes After."
    ]
    InputProcessor.SetNextInputHandler(function () {
        skipIntro = true;
        UI.MessageWindow.html("");
        introText.forEach(value=>{
            UI.AddMessageText("", 2);
            UI.AddMessageText(value, 0);
        })
        promptToContinue();
    });
    var waitTime = 500;
    for (var i = 0; i < introText.length; i++) {
        var message = introText[i];
        window.setTimeout(message => {
            if (!skipIntro) {
                fadeInText(message);
            }
        }, waitTime, message);
        waitTime += 1000 + (message.length * 30);
    }


    window.setTimeout(() => {
        if (!skipIntro) {
            promptToContinue();
        }
    }, waitTime);
}

function promptToContinue() {
    UI.AddMessageHTML("<br><br><span class='glowing'>Press Enter to continue...</span>", 2);
    InputProcessor.SetNextInputHandler(function() {
        UI.MessageWindow.html("");
        var askNameMessage = `
                    <div style="text-align:center">
                        <div id="divTopBorder" style="margin: auto; height:3px; width:200px; background-color:white; border-radius:100%"></div>
                        <div id="divTitle" style="font-size:large; font-weight:bold; margin-top: 10px; margin-bottom: 10px;">What is your name?</div>
                        <div id="divBottomBorder" style="margin:auto; height:3px; width:200px; background-color:white; border-radius:100%"></div>
                    </div>
                `;
        UI.AddMessageHTML(askNameMessage, 2);
        InputProcessor.SetNextInputHandler(function (input) {
            if (input.trim().length == 0 || input.search("[^a-zA-Z0-9_ ]") > -1) {
                UI.AddMessageText("Your name can only contain letters, numbers, spaces, and underscores.", 2);
                UI.AddMessageHTML(askNameMessage, 2);
                InputProcessor.SetNextInputHandler(InputProcessor.NextInputHandler);
                return;
            }
            DataStore.Me.Name = Utilities.EncodeForHTML(input);
            UI.MessageWindow.html("");
            $.get("../HTML/CharacterColorPicker.html", (data) => { UI.AddMessageHTML(data, 1); })
        });
    })
}

function fadeInText(text: string) {
    UI.AddMessageText("", 2);
    for (var i = 0; i < text.length; i++) {
        var letter = text.substr(i, 1);
        window.setTimeout((letter) => {
            if (skipIntro){
                return;
            }
            if (letter == " ") {
                UI.AddMessageText(" ", 0);
            }
            else {
                UI.AddMessageHTML("<div class='fade-in-text'>" + letter + "</div>", 0);
            }
        }, i * 30, letter)
    }
}

import * as After from "../After";
import * as $ from "jquery";
import * as Audio from "../Components/Audio";

export var Init = function(){
    Audio.PlayLoop("./Assets/ceich93__drone-darkemptiness.mp3", null);
    var introText = [
        "You died.",
        "Slowly, your consciousness becomes aware of itself.",
        "You still exist, yet you are nothing.  You are nowhere.  All that remains is an awareness.",
        "The nothingness around you starts to react to your thoughts, to your will.",
        "You command this small pocket of emptiness.",
        "This is your inner void.",
        "You sense others.  They are neither near nor far.  Distance is irrelevant here.",
        "It's time to set out and discover what comes after."
    ]
    
    var waitTime = 500;
    for (var i = 0; i < introText.length; i++){
        var message = introText[i];
        window.setTimeout((message)=>{
            After.UI.FadeInText(message, 0, null);
        }, waitTime, message);
        waitTime += 1000 + (message.length * 30);
    }
    
    
    window.setTimeout(()=>{
        After.UI.AddMessageHTML("<br><br><span class='glowing'>Press Enter to continue...</span>", 2);
        After.UI.NextInputHandler = function(){
            After.UI.MessageWindow.html("");
            var askNameMessage = `
                <div style="text-align:center">
                    <div id="divTopBorder" style="margin: auto; height:3px; width:200px; background-color:white; border-radius:100%"></div>
                    <div id="divTitle" style="font-size:large; font-weight:bold; margin-top: 10px; margin-bottom: 10px;">What is your name?</div>
                    <div id="divBottomBorder" style="margin:auto; height:3px; width:200px; background-color:white; border-radius:100%"></div>
                </div>
            `;
            After.UI.AddMessageHTML(askNameMessage, 2);
            After.UI.NextInputHandler(function(input) {
                if (input.trim().length == 0 || input.search("[^a-zA-Z0-9_ ]") > -1)
                {
                    After.UI.AddMessageText("Your name can only contain letters, numbers, spaces, and underscores.", 2);
                    After.UI.AddMessageHTML(askNameMessage, 2);
                    After.UI.NextInputHandler(After.UI.NextInputHandler);
                    return;
                }
                After.Storage.Me.Name = After.Utilities.EncodeForHTML(input);
                After.UI.MessageWindow.html("");
                $.get("./Widgets/CharacterColor.html", (data)=>{After.UI.AddMessageHTML(data, 1);})
            });
        }
    }, waitTime);
}
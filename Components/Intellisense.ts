import * as UI from "./UI";
import { Command } from "../Models/All";
import * as Commands from "../Components/Commands/All";

export function AutoComplete(){
    var split = UI.IntellisenseFrame.html().split("<br>");
    if (UI.IntellisenseFrame.is(":visible") && split.length > 0){
        var completeWith = split[split.length - 1];
        var text = UI.InputBox.val() as string;
        var lastSeparator = Math.max(
            text.lastIndexOf("."), 
            text.lastIndexOf(" "),
            text.lastIndexOf("("),
            text.lastIndexOf(")"),
            text.lastIndexOf("{"),
            text.lastIndexOf("}")
        );
        if (lastSeparator == -1){
            namespaceAndObject = "";
            UI.InputBox.val(completeWith);
        }
        else {
            var namespaceAndObject = text.slice(0, lastSeparator + 1);
            UI.InputBox.val(namespaceAndObject + completeWith);
        }
        UI.IntellisenseFrame.hide();
    }
   
}
export function EvaluateCommand() {
    if (UI.InputBox.val().toString().trim().length == 0){
        UI.IntellisenseFrame.hide();
        return;
    }
    else {
        UI.IntellisenseFrame.show();
    }
    try {
        UI.IntellisenseFrame.css({
            "transform": `translateX(${UI.InputBox.val().toString().length * .4}em)`,
            "display": "grid"
        });
        var inputArray = (UI.InputBox.val() as string).split(" ");
        var commandMatches:Array<string>;
        var categoryMatches:Array<string>;
        if (inputArray[0].length <= 3){
            commandMatches = Object.keys(Commands).filter(x=>x.toLowerCase().search(inputArray[0].toLowerCase()) > -1);
            categoryMatches = Array.from(new Set(
                Object.keys(Commands).filter(
                    x=>(Commands[x] as Command).Category.toLowerCase().search(inputArray[0].toLowerCase()) > -1).map((value, index)=>{
                        return (Commands[value] as Command).Category;
                    })
                ));
        }
        else {
            commandMatches = Object.keys(Commands).filter(x=>x.toLowerCase().startsWith(inputArray[0].toLowerCase()));
            categoryMatches = Array.from(new Set(
                Object.keys(Commands).filter(
                    x=>(Commands[x] as Command).Category.toLowerCase().startsWith(inputArray[0].toLowerCase())).map((value, index)=>{
                        return (Commands[value] as Command).Category;
                    })
                ));
        }
        UI.IntellisenseFrame.html("");
        if (commandMatches.length + categoryMatches.length > 0){
            for (var i = 0; i < commandMatches.length; i++) {
                UI.IntellisenseFrame.html(UI.IntellisenseFrame.html() +
                    `<div style="grid-column: 1; margin-right: 3px;">${[commandMatches[i]]}</div>` +
                    `<div style="grid-column: 2; text-align: right;">(${(Commands[commandMatches[i]] as Command).Category})</div>`);
            }
            for (var i = 0; i < categoryMatches.length; i++){
                UI.IntellisenseFrame.html(UI.IntellisenseFrame.html() +
                    `<div style="grid-column: 1; margin-right: 3px;">${categoryMatches[i]}</div>` +
                    `<div style="grid-column: 2; text-align:right;">(Category)</div>`);
            }
            if (commandMatches.length + categoryMatches.length == 1){
                if (commandMatches.length == 1){
                    UI.IntellisenseFrame.html(UI.IntellisenseFrame.html() + 
                        `<div style="grid-column-start: 1; grid-column-end:3;">${(Commands[commandMatches[0]] as Command).SummaryText}</div>`);
                }
                else if (categoryMatches.length == 1) {
                    var category = categoryMatches[0].charAt(0).toUpperCase() + categoryMatches[0].substring(1).toLowerCase();
                    UI.IntellisenseFrame.html(UI.IntellisenseFrame.html() + 
                        `<div style="grid-column-start: 1; grid-column-end:3;">Type "Help ${category}" for a list of commands in this category.</div>`);
                }
            }
            resizeIntellisenseWindow();
        }
        else {
            UI.IntellisenseFrame.hide();
        }
    }
    catch (ex){
        UI.IntellisenseFrame.hide();
    }
}
export function EvaluateScript(){
    if (UI.InputBox.val().toString().trim().length == 0){
        UI.IntellisenseFrame.hide();
        return;
    }
    else {
        UI.IntellisenseFrame.show();
    }
    try {
        var text = UI.InputBox.val() as string;
        while (text.search("[ (){}]") > -1) {
            text = text.slice(text.search("[ (){}]") + 1);
        }
        text = "global." + text;
        var lastPeriod = text.lastIndexOf(".");
        var member = text.substr(lastPeriod + 1);
        var namespaceAndObject = text.slice(0, lastPeriod);
        var currentObject = eval(namespaceAndObject);
        if (currentObject instanceof Object){
            var matches;
            var members = new Array<any>();
            members = members.concat(Object.getOwnPropertyNames(currentObject).filter(x=>x.search("__") == -1));
            var prototype = currentObject.__proto__;
            while (prototype != null){
                members = members.concat(Object.getOwnPropertyNames(prototype).filter(x=>x.search("__") == -1));
                prototype = prototype.__proto__;
            }
            // After 3 characters of the member, match more specifically (startsWith).
            if (member.length <= 3) {
                matches = members.filter(value=>{
                    return value.toLowerCase().search(member.toLowerCase()) > -1 && value != "__esModule";
                })
            }
            else {
                matches = members.filter(value=>{
                    return value.toLowerCase().startsWith(member.toLowerCase()) && value != "__esModule";
                })
            }
            if (matches.length > 0){
                UI.IntellisenseFrame.html(matches.join("<br>"));
                resizeIntellisenseWindow();
            }
            else {
                UI.IntellisenseFrame.html("");
                UI.IntellisenseFrame.hide();
            }
        }
        else {
            UI.IntellisenseFrame.html("");
            UI.IntellisenseFrame.hide();
        }
    }
    catch (ex){
        UI.IntellisenseFrame.hide();
    }
}

function resizeIntellisenseWindow(){
    UI.IntellisenseFrame.css("top", "initial");
    UI.IntellisenseFrame.css("width", "initial");
    UI.IntellisenseFrame.css("transform", `translateX(${Math.min(UI.InputBox.val().toString().length * 6, document.body.clientWidth / 2)}px)`);
    if (UI.IntellisenseFrame[0].getBoundingClientRect().right > document.body.clientWidth) {
        UI.IntellisenseFrame.width(document.body.clientWidth - UI.IntellisenseFrame[0].getBoundingClientRect().left);
    }
    if (UI.IntellisenseFrame[0].getBoundingClientRect().top < 0) {
        UI.IntellisenseFrame.css("top", "0");
    }
}
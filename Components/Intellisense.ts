import * as UI from "./UI";
export function AutoComplete(){
    var split = UI.IntellisenseFrame.html().split("<br>");
    if (UI.IntellisenseFrame.is(":visible") && split.length > 0){
        var completeWith = split[split.length - 1];
        var text = UI.InputBox.val() as string;
        var lastPeriod = text.lastIndexOf(".");
        if (lastPeriod == -1){
            namespaceAndObject = "";
            UI.InputBox.val(completeWith);
        }
        else {
            var namespaceAndObject = text.slice(0, lastPeriod);
            UI.InputBox.val(namespaceAndObject + "." + completeWith);
        }
        UI.IntellisenseFrame.hide();
    }
   
}
export function Evaluate(){
    if (UI.InputBox.val().toString().trim().length == 0){
        UI.IntellisenseFrame.hide();
        return;
    }
    else {
        UI.IntellisenseFrame.show();
    }
    try {
        var text = "window." + UI.InputBox.val();
        UI.IntellisenseFrame.css("transform", `translateX(${UI.InputBox.val().toString().length * .35}em)`);
        var lastPeriod = text.lastIndexOf(".");
        var member = text.substr(lastPeriod + 1);
        var namespaceAndObject = text.slice(0, lastPeriod);
        var currentObject = eval(namespaceAndObject);
        if (currentObject instanceof Object){
            var matches = Object.keys(currentObject).filter(value=>{
                return value.toLowerCase().search(member.toLowerCase()) > -1;
            })
            if (matches.length > 0){
                UI.IntellisenseFrame.html(matches.join("<br>"));
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
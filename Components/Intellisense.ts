import * as UI from "./UI";
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
        UI.IntellisenseFrame.css("transform", `translateX(${UI.InputBox.val().toString().length * .4}em)`);
        while (text.search("[ (){}]") > -1) {
            text = text.slice(text.search("[ (){}]") + 1);
        }
        text = "window." + text;
        var lastPeriod = text.lastIndexOf(".");
        var member = text.substr(lastPeriod + 1);
        var namespaceAndObject = text.slice(0, lastPeriod);
        var currentObject = eval(namespaceAndObject);
        if (currentObject instanceof Object){
            var matches;
            // After 3 characters of the member, match more specifically (startsWith).
            if (member.length <= 3) {
                matches = Object.keys(currentObject).filter(value=>{
                    return value.toLowerCase().search(member.toLowerCase()) > -1;
                })
            }
            else {
                matches = Object.keys(currentObject).filter(value=>{
                    return value.toLowerCase().startsWith(member.toLowerCase());
                })
            }
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
export class Command {
    constructor(name:string, commandType:string, summaryText:string, getFullHelpFunction:()=>string, executeFunction:(parameters:Array<string>)=>void){
        this.Name = name;
        this.Category = commandType;
        this.SummaryText = summaryText;
        this.GetFullHelp = getFullHelpFunction;
        this.Execute = executeFunction;
    }
    Name:string;
    Category:string;
    SummaryText:string;
    GetFullHelp:()=>string;
    Execute(parameters:Array<string>){}

    GetHelpTitle():string {
        var titleString = `<br/><div style="display:inline-block; text-align:center; color: steelblue;">`;
        for (var i = 0; i < this.Name.length + 15; i++){
            titleString += "#";
        }
        titleString += "<br/>Command: " + this.Name + "<br/>";
        for (var i = 0; i < this.Name.length + 15; i++){
            titleString += "#";
        }
        titleString += "</div><br><br>";
        titleString += this.SummaryText + "<br><br>";
        return titleString;
    }
}
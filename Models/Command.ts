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
}
export class Command {
    constructor(name:string, commandType:string, summaryText:string, helpText:string, executeFunction:Function){
        this.Name = name;
        this.Category = commandType;
        this.SummaryText = summaryText;
        this.HelpText = helpText;
        this.Execute = executeFunction;
    }
    Name:string;
    Category:string;
    SummaryText:string;
    HelpText:string;
    Execute: Function;
}
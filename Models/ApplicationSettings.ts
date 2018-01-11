export class ApplicationSettings {
    AutoSaveIntervalSeconds: number = 300;
    Colors = {
        "GlobalChat": "seagreen",
        "VoidChat": "lightsteelblue",
        "Whisper": "magenta",
        "System": "lightgray",
        "Debug": "rgb(150,50,50)"
    };
    IsDebugModeEnabled: boolean = false;
    IsNetworkStatusBarVisible: boolean = true;
    InputModeAliases = {
        Command: "/c ",
        GlobalChat: "/g ",
        VoidChat: "/v ",
        Whisper: "/w ",
        Script: "/s "
    };
}
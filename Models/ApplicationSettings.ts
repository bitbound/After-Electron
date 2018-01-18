export class ApplicationSettings {
    AutoSaveIntervalSeconds: number = 300;
    Colors = {
        "GlobalChat": "rgb(0, 255, 64)",
        "VoidChat": "rgb(0, 220, 255)",
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
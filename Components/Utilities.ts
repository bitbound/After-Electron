import * as $ from "jquery";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Storage, FileSystem, UI } from "./Index";


export function ArePropertiesEqual(object1, object2) {
    if (Object.keys(object1).length !== Object.keys(object2).length) {
        return false;
    }

    var match = true;
    var compareFunction = function (compareObj1, compareObj2) {
        for (var key in compareObj1) {
            if (compareObj1[key] instanceof Object) {
                compareFunction(compareObj1[key], compareObj2[key]);
            }
            else {
                if (compareObj1[key] !== compareObj2[key]) {
                    match = false;
                    break;
                }
            }
        }
    }
    compareFunction(object1, object2);

    return match;
}
export function AppendIfMissing(array:Array<any>, item:any, matchKeys:string[]){
    var existingIndex = array.findIndex((value)=>{
        for (var i = 0; i < matchKeys.length; i++) {
            if (item[matchKeys[i]] != value[matchKeys[i]]){
                return false;
            }
        }
        return true;
    });
    if (existingIndex == -1){
        array.push(item);
    }   
}
export var ColorNames = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenrod", "DarkGray", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "Goldenrod", "Gray", "Green", "GreenYellow", "Honeydew", "HotPink", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenrodYellow", "LightGreen", "LightGrey", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquamarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenrod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "Seashell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];
export function ColorNameToHex(colour:string):string {
    var colours = {
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aqua": "#00ffff",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "blanchedalmond": "#ffebcd",
        "blue": "#0000ff",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "gray": "#808080",
        "green": "#008000",
        "greenyellow": "#adff2f",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred ": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "lime": "#00ff00",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "maroon": "#800000",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370d8",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "navy": "#000080",
        "oldlace": "#fdf5e6",
        "olive": "#808000",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#d87093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "purple": "#800080",
        "red": "#ff0000",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "silver": "#c0c0c0",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "teal": "#008080",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "white": "#ffffff",
        "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00",
        "yellowgreen": "#9acd32"
    };

    if (typeof colours[colour.toLowerCase()] != 'undefined') {
        return colours[colour.toLowerCase()];
    }

    return "";
};

export function CreateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

export function DataBindOneWay(DataObject: Object, ObjectProperty: string,
                                PostSetterFunction: Function, PreGetterFunction: Function) {
    var backingValue;
    Object.defineProperty(DataObject, ObjectProperty, {
        configurable: true,
        enumerable: true,
        get() {
            if (PreGetterFunction) {
                PreGetterFunction();
            }
            return backingValue;
        },
        set(value: any) {
            backingValue = value;
            if (PostSetterFunction) {
                PostSetterFunction();
            }
        }
    });
};
export function DataBindTwoWay(DataObject: Object, ObjectProperty: string,
                         Element: HTMLElement, ElementPropertyKey: string,
                         PostSetterFunction: Function, PreGetterFunction: Function) {
    Object.defineProperty(DataObject, ObjectProperty, {
        configurable: true,
        enumerable: true,
        get() {
            if (PreGetterFunction) {
                PreGetterFunction();
            }
            return Element[ElementPropertyKey];
        },
        set(value: any) {
            Element[ElementPropertyKey] = value;
            if (PostSetterFunction) {
                PostSetterFunction();
            }
        }
    });
    Element.onchange = function(e) {
        if (PostSetterFunction) {
            PostSetterFunction();
        }
       DataObject[ObjectProperty] = Element[ElementPropertyKey];
    };
};

export function EncodeForHTML(input:string) {
    return $("<div>").text(input).html();
};

export function GetRandom(Min:number, Max:number, Round:boolean): number {
    if (Min > Max) {
        throw "Min must be less than max.";
    }
    var ran = Math.random();
    var diff = Max - Min;
    var result = ran * diff;
    if (Round) {
        return Math.round(result + Min);
    }
    else {
        return result + Min;
    }
};
export function HexToRGB(col:string):string {
    var r, g, b;
    if (col.charAt(0) == '#') {
        col = col.substr(1);
    }
    r = col.charAt(0) + col.charAt(1);
    g = col.charAt(2) + col.charAt(3);
    b = col.charAt(4) + col.charAt(5);
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
};
export function IsLocalIP(ip:string):boolean{
    // Get IPv4 address when ip is v6 and v4 together, as in socket.remoteAddress.
    var split = ip.split(":");
    var ipv4 = split[split.length - 1];
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var key in interfaces) {
        for (var key2 in interfaces[key]) {
            var address = interfaces[key][key2];
            if (key.search("Loopback") > -1 && address.address == ipv4){
                return true;
            }
            else if (address.family == 'IPv4' && !address.internal && address.address == ipv4) {
                return true;
            }
        }
    }
    return false;
}
export function Log(message:string){
    console.log(message);
    var logPath = path.join(FileSystem.UserDataPath, "Log.txt");
    fs.appendFileSync(logPath, (new Date()).toLocaleString() + " -   " + message + "\r\n")
}
export function NumberIsBetween(NumberAnalyzed: number, Min: number, Max: number, IncludeMinMax: boolean): boolean {
    if (IncludeMinMax) {
        if (NumberAnalyzed == Min || NumberAnalyzed == Max) {
            return true;
        }
    }
    if (NumberAnalyzed > Min && NumberAnalyzed < Max) {
        return true;
    }
    else {
        return false;
    }
};
export function StringifyCircular(inputObject:any): string {
    Storage.Temp.JSONObjects = new Array<any>();
    return JSON.stringify(inputObject, function(key, value){
        if (typeof value == "object" && value != null) {
            if (Storage.Temp.JSONObjects.findIndex(x=>x == value) > -1) {
                return "[Possible circular reference.]"
            }
            else {
                Storage.Temp.JSONObjects.push(value);
            }
        }
        return value;
    })
}
export function UpdateAndAppend(array:Array<any>, item:any, matchKeys:string[]){
    var existingIndex = array.findIndex((value)=>{
        for (var i = 0; i < matchKeys.length; i++) {
            if (item[matchKeys[i]] != value[matchKeys[i]]){
                return false;
            }
        }
        return true;
    });
    if (existingIndex > -1){
        array.splice(existingIndex, 1);
    }
    array.push(item);
}
export function UpdateAndPrepend(array:Array<any>, item:any, matchKeys:string[]){
    var existingIndex = array.findIndex((value)=>{
        for (var i = 0; i < matchKeys.length; i++) {
            if (item[matchKeys[i]] != value[matchKeys[i]]){
                return false;
            }
        }
        return true;
    });
    if (existingIndex > -1){
        array.splice(existingIndex, 1);
    }
    array.unshift(item);
}

export function ReplaceAllInString(inputString:string, toReplace:string, replaceWith:string):string{
    try {
        return inputString.split(toReplace).join(replaceWith);
    }
    catch (ex){
        return inputString;
    }
}
export function WriteDebug(message:string, newLines: number){
    if (Storage.ClientSettings.IsDebugMode){
        UI.AddDebugMessage(message, newLines);
    }
}
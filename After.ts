import * as $ from "jquery"
import * as path from "path";
import * as fs from "fs";
import * as net from "net";
import * as electron from "electron";
import * as audio from "./Components/Audio";
import * as io from "./Components/IO";
import * as connectivity from "./Components/Connectivity";
import * as ui from "./Components/UI";
import * as models from "./Components/Models";
import * as storage from "./Components/Storage";
import * as utilities from "./Components/Utilities";


export var NodeJS = {
    path: path,
    fs: fs,
    net: net
};
export var Audio = audio;
export var Electron = electron;
export var IO = io;
export var Connectivity = connectivity
export var UI = ui;
export var Models = models;
export var Storage = storage;
export var Utilities = utilities;
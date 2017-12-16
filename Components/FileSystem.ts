
import * as fs from "fs";
import * as electron from "electron";
import * as path from "path";
import { FileSystem } from "./All";

export var AppRootPath = electron.remote.app.getAppPath();

export var UserDataPath = electron.remote.app.getPath("userData");
export var StorageDataPath = path.join(electron.remote.app.getPath("userData"), "Storage");


export function GetDirectoriesRecursively(path:string, directoryArray:string[]) {
    directoryArray = directoryArray || new Array();
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (item, index) {
            var currentPath = path + "\\" + item;
            if (fs.lstatSync(currentPath).isDirectory()) {
                directoryArray.push(currentPath);
                FileSystem.GetDirectoriesRecursively(currentPath, directoryArray);
            }
        });
    }
    return directoryArray;
}

export function GetFilesRecursively(path:string, fileArray:string[]) {
    fileArray = fileArray || new Array();
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (item, index) {
            var currentPath = path + "\\" + item;
            if (fs.lstatSync(currentPath).isDirectory()) {
                FileSystem.GetFilesRecursively(currentPath, fileArray);
            }
            else if (fs.lstatSync(currentPath).isFile()) {
                fileArray.push(currentPath);
            }
        });
    }
    return fileArray;
}
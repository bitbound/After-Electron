
import * as fs from "fs";
import * as electron from "electron";
import * as path from "path";
import { FileSystem } from "./All";
import { dirname } from "path";

export var AppRootPath = electron.remote.app.getAppPath();

export var UserDataPath = electron.remote.app.getPath("userData");
export var StorageDataPath = path.join(electron.remote.app.getPath("userData"), "Storage");


export function GetDirectoriesRecursively(dirPath:string, directoryArray:string[]) {
    directoryArray = directoryArray || new Array();
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(function (item, index) {
            var currentPath = dirPath + "\\" + item;
            if (fs.lstatSync(currentPath).isDirectory()) {
                directoryArray.push(currentPath);
                FileSystem.GetDirectoriesRecursively(currentPath, directoryArray);
            }
        });
    }
    return directoryArray;
}

export function GetFilesRecursively(dirPath:string, fileArray:string[]) {
    fileArray = fileArray || new Array();
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(function (item, index) {
            var currentPath = dirPath + "\\" + item;
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

export function MakeDirectoriesRecursively(dirPath:string){
    if (fs.existsSync(dirPath) == false){
        var currentDir = dirPath;
        var directoriesToCreate = new Array<string>();
        while (fs.existsSync(currentDir) == false) {
            directoriesToCreate.push(currentDir);
            currentDir = dirname(currentDir);
        }
        while (directoriesToCreate.length > 0){
            fs.mkdirSync(directoriesToCreate.pop());
        }
    }
}
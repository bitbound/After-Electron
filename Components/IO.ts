
import * as fs from "fs";
import * as electron from "electron";
import * as path from "path";
import * as IO from "./IO";

export var AppRootPath = electron.remote.app.getAppPath();

export var UserDataPath = electron.remote.app.getPath("userData");
export var StorageDataPath = path.join(electron.remote.app.getPath("userData"), "Storage");


export var Directory = new class Directory {
    GetDirectoriesRecursively(path:string, directoryArray:string[]) {
        directoryArray = directoryArray || new Array();
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (item, index) {
                var currentPath = path + "\\" + item;
                if (fs.lstatSync(currentPath).isDirectory()) {
                    directoryArray.push(currentPath);
                    IO.Directory.GetDirectoriesRecursively(currentPath, directoryArray);
                }
            });
        }
        return directoryArray;
    }
};

export var File = new class File {
    GetFilesRecursively(path:string, fileArray:string[]) {
        fileArray = fileArray || new Array();
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (item, index) {
                var currentPath = path + "\\" + item;
                if (fs.lstatSync(currentPath).isDirectory()) {
                    IO.File.GetFilesRecursively(currentPath, fileArray);
                }
                else if (fs.lstatSync(currentPath).isFile()) {
                    fileArray.push(currentPath);
                }
            });
        }
        return fileArray;
    }
};
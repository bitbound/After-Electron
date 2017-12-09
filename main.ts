"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
import * as electron from "electron";
// Module to control application life.
var app = electron.app;
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow;
var path = require('path');
var url = require('url');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 850,
        height: 650,
        minWidth: 850,
        minHeight: 650,
        icon: "./Assets/A-512.png"
    });
    //mainWindow.setMenu(null);
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/HTML/Index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        app.exit();
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// Message from mainWindow that tells the main process to
// open the options window.
electron.ipcMain.on("options-menu", (event, args) =>{
    var optionsWindow = new electron.BrowserWindow({
        width: 700,
        height: 500,
        minWidth: 700,
        minHeight: 500,
        icon: "./Assets/A-512.png"
    });
    optionsWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/HTML/Options.html'),
        protocol: 'file:',
        slashes: true
    }));
    optionsWindow.webContents.executeJavaScript(`applyStorageData('${args}')`);
})

// Message from options window that contains updated options.
// The updated options get sent to mainWindow to be applied and saved.
electron.ipcMain.on("options-update", (event, args)=>{

})
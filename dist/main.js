"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const original_fs_1 = require("original-fs");
const path_1 = __importDefault(require("path"));
let win;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile('index.html');
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.ipcMain.on('OPENFILE', () => {
    electron_1.dialog.showOpenDialog(win, {
        properties: ["openFile"],
        filters: [{ name: "open file", extensions: ["txt", "js", "md", "py"] }]
    }).then(file => {
        const path = file.filePaths[0];
        (0, original_fs_1.readFile)(path, "utf-8", (err, content) => {
            if (err) {
                console.log("Open File Error: ", err);
                return false;
            }
            if (path == '') {
                return false;
            }
            win.webContents.send("GOT DOCUMENT", { path, content });
        });
    });
});
electron_1.ipcMain.on("SAVEFILE", (_, { CurrentPath, content }) => {
    console.log(CurrentPath);
    if (!(0, original_fs_1.existsSync)(CurrentPath) || CurrentPath == '') {
        electron_1.dialog.showSaveDialog(win, {
            filters: [
                { name: "Text File", extensions: ["txt", "js", "md", "py"] }
            ]
        }).then(file => {
            const path = file.filePath;
            (0, original_fs_1.writeFile)(`${path}`, content, err => {
                console.log("Write File Error1: ", err);
            });
        });
    }
    else {
        (0, original_fs_1.writeFile)(`${CurrentPath}`, content, err => {
            if (err) {
                console.log("Write File Error2: ", err);
            }
        });
    }
});

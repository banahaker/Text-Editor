import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { existsSync, readFile, writeFile } from 'original-fs'
import path from 'path'

let win: BrowserWindow

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('OPENFILE', () => {
  dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "open file", extensions: ["txt", "js", "md", "py"] }]
  }).then(file => {
    const path = file.filePaths[0]
    readFile(path, "utf-8", (err, content) => {
      if (err) {
        console.log("Open File Error: ", err)
        return false
      }
      if (path == '') {
        return false
      }
      win.webContents.send("GOT DOCUMENT", { path, content })
    })
  })
})

ipcMain.on("SAVEFILE", (_, { CurrentPath, content }) => {
  console.log(CurrentPath)
  if (!existsSync(CurrentPath) || CurrentPath == '') {
    dialog.showSaveDialog(win, {
      filters: [
        { name: "Text File", extensions: ["txt", "js", "md", "py"] }
      ]
    }).then(file => {
      const path = file.filePath
      writeFile(`${path}`, content, err => {
        console.log("Write File Error1: ", err)
      })
    })
  } else {
    writeFile(`${CurrentPath}`, content, err => {
      if (err) {
        console.log("Write File Error2: ", err)
      }
    })
  }
})
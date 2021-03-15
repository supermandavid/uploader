
const { SIGUNUSED } = require('constants')
const { app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')
const shell = require('electron').shell
const ipc =  require('electron').ipcMain
require('electron-reload')(__dirname)

function createWindow () {
  const win = new BrowserWindow({
    width: 1050,
    height: 700,
    minWidth: 700,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join('views/index.js')
    }
  })

  win.loadFile('views/index.html')
  win.openDevTools()


  var menu = Menu.buildFromTemplate([
    {
        label: 'Home',
        submenu: [
            {
                label:'About',
                click(){
                    shell.openExternal('http://helloloveworld.net')
                }
            },
            {type:"separator"},
            { 
                label:'Exit',
                click(){
                    app.quit() 
                }
            }
        ],
    },
    {
        label: 'Menu',
        submenu: [
            {label:'Menu Item 1'},
            {
                label:'Open Dashboard',
                click(){
                    shell.openExternal('http://helloloveworld.net')
                }
            },
            {type:"separator"},
            { 
                label:'Exit',
                click(){
                    app.quit() 
                }
            }
        ],
    }
])

Menu.setApplicationMenu(menu)
  
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipc.on('signup-state', function (event, arg ) {
    win.webContents.send('sign-state ', argcl)
})




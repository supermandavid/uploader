const electron = require('electron')
const path = require('path')
const remote = electron.remote
const ipc = electron.ipcRenderer


function close(){
    var window = remote.getCurrentWindow();
    window.close();
}

function sendData(){
    ipc.send('signup-state', 'actual value to send')
}
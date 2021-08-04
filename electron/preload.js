console.log("running preload")
const { ipcRenderer } = require('electron');
window.ipcRenderer = ipcRenderer;

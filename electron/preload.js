const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electron', {
  // Estado del servidor
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),
  
  // Reiniciar servidor
  restartServer: () => ipcRenderer.invoke('restart-server'),
  
  // Abrir DevTools
  openDevTools: () => ipcRenderer.invoke('open-devtools'),
  
  // Información de la plataforma
  platform: process.platform,
  
  // Versión de Electron
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;
let serverProcess;
let tray;
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || 4000;

// Crear ventana principal con soporte responsive
function createWindow() {
  // Obtener tamaño de pantalla
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // Calcular tamaño de ventana (80% de la pantalla)
  const windowWidth = Math.min(1400, Math.floor(screenWidth * 0.8));
  const windowHeight = Math.min(900, Math.floor(screenHeight * 0.8));
  
  // Tamaños mínimos adaptativos
  const minWidth = Math.min(800, Math.floor(screenWidth * 0.5));
  const minHeight = Math.min(600, Math.floor(screenHeight * 0.5));

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    icon: path.join(__dirname, '../public/smart-sales-bot-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      zoomFactor: 1.0, // Zoom inicial
      enableRemoteModule: false,
      sandbox: true
    },
    backgroundColor: '#0f172a',
    show: false,
    frame: true,
    titleBarStyle: 'default',
    resizable: true, // Permitir redimensionar
    maximizable: true, // Permitir maximizar
    fullscreenable: true, // Permitir pantalla completa
    center: true // Centrar en pantalla
  });

  // Esperar a que el servidor esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Ajustar zoom según tamaño de pantalla
    adjustZoomLevel();
  });

  // Ajustar zoom cuando se redimensiona
  mainWindow.on('resize', () => {
    adjustZoomLevel();
  });

  // Cargar la aplicación
  const startUrl = isDev 
    ? `http://localhost:${PORT}`
    : `http://localhost:${PORT}`;

  mainWindow.loadURL(startUrl);

  // Abrir DevTools en desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Minimizar a bandeja en lugar de cerrar
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

// Ajustar nivel de zoom según tamaño de ventana
function adjustZoomLevel() {
  if (!mainWindow) return;
  
  const [width] = mainWindow.getSize();
  let zoomFactor = 1.0;
  
  // Ajustar zoom según ancho de ventana
  if (width < 1000) {
    zoomFactor = 0.85; // Reducir zoom en ventanas pequeñas
  } else if (width < 1200) {
    zoomFactor = 0.9;
  } else if (width > 1600) {
    zoomFactor = 1.1; // Aumentar zoom en ventanas grandes
  }
  
  mainWindow.webContents.setZoomFactor(zoomFactor);
}

// Crear icono de bandeja
function createTray() {
  const iconPath = path.join(__dirname, '../public/logo.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar Smart Sales Bot',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Estado del Bot',
      submenu: [
        { label: 'WhatsApp: Conectado', enabled: false },
        { label: 'IA: Activa', enabled: false },
        { type: 'separator' },
        { label: 'Ver Dashboard', click: () => mainWindow.show() }
      ]
    },
    { type: 'separator' },
    {
      label: 'Reiniciar Servidor',
      click: () => {
        restartServer();
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Smart Sales Bot Pro');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });
}

// Iniciar servidor Node.js
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Iniciando servidor...');

    // En desarrollo, usar script batch que llama a npx tsx
    // En producción, usar node directamente
    let command, args, options;
    
    if (isDev) {
      // Usar script batch en desarrollo
      const batchScript = path.join(__dirname, 'start-server.bat');
      command = 'cmd.exe';
      args = ['/c', batchScript];
      options = {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, ELECTRON_MODE: 'true' },
        stdio: 'pipe',
        shell: true
      };
    } else {
      // Usar node en producción
      const serverScript = path.join(__dirname, '../server.js');
      command = 'node';
      args = [serverScript];
      options = {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, ELECTRON_MODE: 'true' },
        stdio: 'pipe'
      };
    }

    serverProcess = spawn(command, args, options);

    serverProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`[Server] ${message}`);
      
      if (message.includes('Server running') || message.includes('ready')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Error al iniciar servidor:', error);
      reject(error);
    });

    serverProcess.on('close', (code) => {
      console.log(`Servidor cerrado con código ${code}`);
    });

    // Timeout de 30 segundos
    setTimeout(() => {
      resolve(); // Continuar de todos modos
    }, 30000);
  });
}

// Reiniciar servidor
function restartServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
  startServer().then(() => {
    mainWindow.reload();
  });
}

// Detener servidor
function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

// Inicialización de la app
app.whenReady().then(async () => {
  try {
    // Iniciar servidor primero
    await startServer();
    
    // Esperar un poco para que el servidor esté completamente listo
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Crear ventana y bandeja
    createWindow();
    createTray();

    console.log('✅ Smart Sales Bot Pro iniciado correctamente');
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
  }
});

// Manejar activación en macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// Cerrar todo al salir
app.on('before-quit', () => {
  app.isQuitting = true;
  stopServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-server-status', async () => {
  return {
    running: serverProcess !== null,
    port: PORT
  };
});

ipcMain.handle('restart-server', async () => {
  restartServer();
  return { success: true };
});

ipcMain.handle('open-devtools', () => {
  mainWindow.webContents.openDevTools();
});

# 💻 Implementación de Aplicación de Escritorio con Electron

**Smart Sales Bot Pro - Desktop Edition**

---

## 🎯 OBJETIVO

Crear una aplicación de escritorio multiplataforma (Windows, Mac, Linux) que permita a los usuarios acceder al dashboard sin necesidad de un navegador web.

---

## 📋 CARACTERÍSTICAS

### Funcionalidades Principales

1. **Dashboard Completo**
   - Toda la funcionalidad web disponible
   - Navegación nativa
   - Shortcuts de teclado

2. **Tray Icon (Bandeja del Sistema)**
   - Acceso rápido desde la bandeja
   - Notificaciones nativas
   - Estado de WhatsApp visible

3. **Notificaciones Nativas**
   - Nuevos mensajes de WhatsApp
   - Pagos recibidos
   - Alertas del sistema
   - Sonidos personalizados

4. **Auto-actualización**
   - Actualizaciones automáticas
   - Changelog integrado
   - Rollback si falla

5. **Offline Mode (Opcional)**
   - Caché de datos básicos
   - Sincronización al reconectar

---

## 🛠️ STACK TECNOLÓGICO

```json
{
  "electron": "^28.0.0",
  "electron-builder": "^24.9.1",
  "electron-updater": "^6.1.7",
  "concurrently": "^8.2.2",
  "wait-on": "^7.2.0"
}
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
smart-sales-bot-desktop/
├── electron/
│   ├── main.ts                 # Proceso principal de Electron
│   ├── preload.ts              # Script de preload (seguridad)
│   ├── tray.ts                 # Icono en bandeja del sistema
│   ├── updater.ts              # Sistema de auto-actualización
│   ├── notifications.ts        # Notificaciones nativas
│   └── shortcuts.ts            # Atajos de teclado
├── src/                        # Código Next.js existente (sin cambios)
├── public/
│   ├── icons/                  # Iconos para diferentes plataformas
│   │   ├── icon.ico            # Windows
│   │   ├── icon.icns           # macOS
│   │   └── icon.png            # Linux
│   └── sounds/                 # Sonidos de notificación
├── electron-builder.json       # Configuración de empaquetado
├── package.json                # Scripts actualizados
└── README_DESKTOP.md           # Documentación de la app desktop
```

---

## 🚀 PASO 1: INSTALACIÓN DE DEPENDENCIAS

```bash
npm install --save-dev electron electron-builder electron-updater
npm install --save-dev concurrently wait-on cross-env
npm install --save-dev @types/node
```

---

## 📝 PASO 2: CONFIGURAR package.json

```json
{
  "name": "smart-sales-bot-desktop",
  "version": "1.0.0",
  "description": "Smart Sales Bot Pro - Desktop Application",
  "main": "electron/main.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:pack": "npm run build && electron-builder --dir",
    "electron:dist:win": "npm run build && electron-builder --win",
    "electron:dist:mac": "npm run build && electron-builder --mac",
    "electron:dist:linux": "npm run build && electron-builder --linux",
    "electron:dist:all": "npm run build && electron-builder -mwl"
  },
  "build": {
    "appId": "com.smartsalesbot.app",
    "productName": "Smart Sales Bot Pro",
    "copyright": "Copyright © 2025 Tecnovariedades D&S",
    "directories": {
      "output": "dist",
      "buildResources": "public"
    },
    "files": [
      "electron/**/*",
      ".next/**/*",
      "public/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "public/icons",
        "to": "icons"
      }
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "public/icons/icon.ico",
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Smart Sales Bot Pro"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "public/icons/icon.icns",
      "category": "public.app-category.business",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "dmg": {
      "contents": [
        {
          "x": 130,
          "y": 220
        },
        {
          "x": 410,
          "y": 220,
          "type": "link",
          "path": "/Applications"
        }
      ]
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "icon": "public/icons/icon.png",
      "category": "Office",
      "maintainer": "Tecnovariedades D&S"
    },
    "publish": {
      "provider": "github",
      "owner": "tu-usuario",
      "repo": "smart-sales-bot"
    }
  }
}
```

---

## 💻 PASO 3: CREAR PROCESO PRINCIPAL (electron/main.ts)

```typescript
import { app, BrowserWindow, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import serve from 'electron-serve'

// Configurar servidor para archivos estáticos en producción
const loadURL = serve({ directory: '.next' })

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const isDev = process.env.NODE_ENV === 'development'
const port = process.env.PORT || 3000

// Prevenir múltiples instancias
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/smart-sales-bot-logo.png'),
    title: 'Smart Sales Bot Pro',
    backgroundColor: '#ffffff',
    show: false // No mostrar hasta que esté listo
  })

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Cargar la aplicación
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${port}`)
    mainWindow.webContents.openDevTools()
  } else {
    loadURL(mainWindow)
  }

  // Abrir links externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Minimizar a la bandeja en lugar de cerrar
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/smart-sales-bot-logo.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      }
    },
    {
      label: 'Estado WhatsApp',
      submenu: [
        { label: 'Conectado ✅', enabled: false },
        { type: 'separator' },
        { label: 'Ver QR', click: () => {} },
        { label: 'Reconectar', click: () => {} }
      ]
    },
    { type: 'separator' },
    {
      label: 'Notificaciones',
      type: 'checkbox',
      checked: true,
      click: (menuItem) => {
        // Toggle notificaciones
      }
    },
    { type: 'separator' },
    {
      label: 'Acerca de',
      click: () => {
        // Mostrar ventana de about
      }
    },
    {
      label: 'Salir',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('Smart Sales Bot Pro')
  
  // Doble click para abrir
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

// Configurar auto-actualización
function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify()
  
  autoUpdater.on('update-available', () => {
    console.log('Actualización disponible')
  })
  
  autoUpdater.on('update-downloaded', () => {
    console.log('Actualización descargada')
    // Notificar al usuario
  })
}

// Inicialización
app.whenReady().then(() => {
  createWindow()
  createTray()
  
  if (!isDev) {
    setupAutoUpdater()
  }
  
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

app.on('before-quit', () => {
  app.isQuitting = true
})
```

---

## 🔒 PASO 4: CREAR PRELOAD SCRIPT (electron/preload.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron'

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electron', {
  // Notificaciones
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body })
  },
  
  // Estado de WhatsApp
  getWhatsAppStatus: () => {
    return ipcRenderer.invoke('get-whatsapp-status')
  },
  
  // Actualización
  checkForUpdates: () => {
    ipcRenderer.send('check-for-updates')
  },
  
  // Sistema
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version')
  },
  
  // Eventos
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
  
  off: (channel: string, callback: Function) => {
    ipcRenderer.removeListener(channel, callback as any)
  }
})

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    electron: {
      showNotification: (title: string, body: string) => void
      getWhatsAppStatus: () => Promise<any>
      checkForUpdates: () => void
      getAppVersion: () => Promise<string>
      on: (channel: string, callback: Function) => void
      off: (channel: string, callback: Function) => void
    }
  }
}
```

---

## 🔔 PASO 5: SISTEMA DE NOTIFICACIONES (electron/notifications.ts)

```typescript
import { Notification, nativeImage } from 'electron'
import path from 'path'

export class NotificationService {
  static show(title: string, body: string, icon?: string) {
    const notification = new Notification({
      title,
      body,
      icon: icon || path.join(__dirname, '../public/smart-sales-bot-logo.png'),
      sound: 'default'
    })
    
    notification.show()
    
    notification.on('click', () => {
      // Abrir ventana principal
    })
  }
  
  static showNewMessage(customerName: string, message: string) {
    this.show(
      `Nuevo mensaje de ${customerName}`,
      message.slice(0, 100)
    )
  }
  
  static showPaymentReceived(amount: number, method: string) {
    this.show(
      '💰 Pago Recibido',
      `$${amount.toLocaleString()} vía ${method}`
    )
  }
  
  static showWhatsAppDisconnected() {
    this.show(
      '⚠️ WhatsApp Desconectado',
      'Reconecta tu WhatsApp para seguir recibiendo mensajes'
    )
  }
}
```

---

## ⌨️ PASO 6: SHORTCUTS DE TECLADO (electron/shortcuts.ts)

```typescript
import { globalShortcut, BrowserWindow } from 'electron'

export function registerShortcuts(mainWindow: BrowserWindow) {
  // Ctrl+Shift+D - Abrir DevTools
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    mainWindow.webContents.toggleDevTools()
  })
  
  // Ctrl+R - Recargar
  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.reload()
  })
  
  // Ctrl+Q - Salir
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit()
  })
  
  // Ctrl+N - Nueva ventana
  globalShortcut.register('CommandOrControl+N', () => {
    // Abrir nueva ventana
  })
}

export function unregisterShortcuts() {
  globalShortcut.unregisterAll()
}
```

---

## 🎨 PASO 7: CREAR ICONOS

### Windows (.ico)
```bash
# Usar herramienta online o ImageMagick
convert smart-sales-bot-logo.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### macOS (.icns)
```bash
# Crear iconset
mkdir icon.iconset
sips -z 16 16     smart-sales-bot-logo.png --out icon.iconset/icon_16x16.png
sips -z 32 32     smart-sales-bot-logo.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     smart-sales-bot-logo.png --out icon.iconset/icon_32x32.png
sips -z 64 64     smart-sales-bot-logo.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   smart-sales-bot-logo.png --out icon.iconset/icon_128x128.png
sips -z 256 256   smart-sales-bot-logo.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   smart-sales-bot-logo.png --out icon.iconset/icon_256x256.png
sips -z 512 512   smart-sales-bot-logo.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   smart-sales-bot-logo.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 smart-sales-bot-logo.png --out icon.iconset/icon_512x512@2x.png

# Convertir a icns
iconutil -c icns icon.iconset
```

---

## 🚀 PASO 8: DESARROLLO Y TESTING

```bash
# Desarrollo (con hot reload)
npm run electron:dev

# Build para testing (sin instalador)
npm run electron:pack

# Build completo con instalador
npm run electron:dist:win    # Windows
npm run electron:dist:mac    # macOS
npm run electron:dist:linux  # Linux
npm run electron:dist:all    # Todas las plataformas
```

---

## 📦 PASO 9: DISTRIBUCIÓN

### Opciones de Distribución

1. **GitHub Releases**
   - Auto-actualización integrada
   - Descarga directa
   - Changelog automático

2. **Microsoft Store** (Windows)
   - Distribución oficial
   - Actualizaciones automáticas
   - Requiere certificado

3. **Mac App Store** (macOS)
   - Distribución oficial
   - Requiere Apple Developer Account
   - Proceso de revisión

4. **Snap Store** (Linux)
   - Distribución universal
   - Auto-actualización
   - Fácil instalación

---

## 🔐 PASO 10: FIRMA DE CÓDIGO

### Windows
```bash
# Requiere certificado de firma de código
# Configurar en electron-builder.json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

### macOS
```bash
# Requiere Apple Developer Account
# Configurar en electron-builder.json
{
  "mac": {
    "identity": "Developer ID Application: Tu Nombre (TEAM_ID)"
  }
}
```

---

## 📊 MÉTRICAS Y ANALYTICS

```typescript
// Integrar analytics (opcional)
import { app } from 'electron'
import Analytics from 'electron-google-analytics'

const analytics = new Analytics('UA-XXXXXXXXX-X')

app.on('ready', () => {
  analytics.send('screenview', { cd: 'Dashboard' })
})
```

---

## 🎯 PRÓXIMOS PASOS

1. **Semana 1**: Setup básico y ventana principal
2. **Semana 2**: Tray icon y notificaciones
3. **Semana 3**: Auto-actualización y testing
4. **Semana 4**: Empaquetado y distribución

---

## 📚 RECURSOS

- [Electron Docs](https://www.electronjs.org/docs/latest/)
- [Electron Builder](https://www.electron.build/)
- [Electron Forge](https://www.electronforge.io/)
- [Next.js + Electron Example](https://github.com/vercel/next.js/tree/canary/examples/with-electron)

---

**Última actualización**: 20 de Noviembre 2025  
**Estado**: 📝 Documentación Completa

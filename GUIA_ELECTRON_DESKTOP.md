# 🖥️ Guía Completa - Smart Sales Bot Pro Desktop

## 📋 Descripción

Versión de escritorio de Smart Sales Bot Pro construida con **Electron**. Funciona como una aplicación nativa de Windows, macOS y Linux con todas las funcionalidades del sistema web.

## ✨ Características de la Versión Desktop

### 🎯 Ventajas sobre la Versión Web

1. **Aplicación Nativa**
   - Icono en el escritorio
   - Inicio automático con Windows (opcional)
   - Minimizar a bandeja del sistema
   - No requiere navegador abierto

2. **Mejor Rendimiento**
   - Servidor integrado
   - Menor consumo de recursos
   - Inicio más rápido
   - Optimizado para escritorio

3. **Funcionalidades Adicionales**
   - Notificaciones nativas del sistema
   - Atajos de teclado globales
   - Integración con el sistema operativo
   - Actualizaciones automáticas

4. **Seguridad Mejorada**
   - Datos locales encriptados
   - No expone puertos al exterior
   - Sesión persistente segura
   - Protección contra ataques web

## 🚀 Instalación y Uso

### Opción 1: Modo Desarrollo (Para Probar)

```bash
# 1. Instalar dependencias de Electron
npm install --save-dev electron electron-builder

# 2. Iniciar en modo desarrollo
npm run electron:dev
```

O usar el archivo batch:
```bash
iniciar-electron.bat
```

### Opción 2: Construir Instalador (Para Distribución)

```bash
# Construir instalador para Windows
npm run electron:build:win

# Construir para macOS
npm run electron:build:mac

# Construir para Linux
npm run electron:build:linux
```

O usar el archivo batch:
```bash
construir-instalador.bat
```

## 📦 Tipos de Instaladores Generados

### Windows
- **NSIS Installer** (`Smart-Sales-Bot-Pro-1.0.0-x64.exe`)
  - Instalador tradicional con asistente
  - Se instala en Program Files
  - Crea accesos directos
  - Desinstalador incluido
  - Tamaño: ~150-200 MB

- **Portable** (`Smart-Sales-Bot-Pro-1.0.0-portable.exe`)
  - No requiere instalación
  - Ejecutar desde USB o carpeta
  - Ideal para pruebas
  - Tamaño: ~150-200 MB

### macOS
- **DMG** (`Smart-Sales-Bot-Pro-1.0.0.dmg`)
  - Instalador estándar de Mac
  - Arrastrar a Applications
  - Tamaño: ~150-200 MB

- **ZIP** (`Smart-Sales-Bot-Pro-1.0.0-mac.zip`)
  - Versión comprimida
  - Extraer y ejecutar

### Linux
- **AppImage** (`Smart-Sales-Bot-Pro-1.0.0.AppImage`)
  - Ejecutable universal
  - No requiere instalación
  - Compatible con todas las distros

- **DEB** (`Smart-Sales-Bot-Pro-1.0.0.deb`)
  - Para Debian/Ubuntu
  - `sudo dpkg -i Smart-Sales-Bot-Pro-1.0.0.deb`

- **RPM** (`Smart-Sales-Bot-Pro-1.0.0.rpm`)
  - Para Fedora/RedHat/CentOS
  - `sudo rpm -i Smart-Sales-Bot-Pro-1.0.0.rpm`

## 🎨 Interfaz de Usuario

### Ventana Principal
- **Tamaño**: 1400x900 px (redimensionable)
- **Mínimo**: 1200x700 px
- **Tema**: Oscuro por defecto
- **DevTools**: F12 o Ctrl+Shift+I

### Icono de Bandeja
- **Click izquierdo**: Mostrar/ocultar ventana
- **Click derecho**: Menú contextual
  - Mostrar Smart Sales Bot
  - Estado del Bot
  - Reiniciar Servidor
  - Salir

### Atajos de Teclado
- `Ctrl+R` - Recargar aplicación
- `Ctrl+Shift+I` - Abrir DevTools
- `Ctrl+Q` - Salir
- `Ctrl+M` - Minimizar a bandeja

## 🔧 Configuración

### Variables de Entorno

La aplicación usa el archivo `.env` en la carpeta de instalación:

```env
# Base de datos
DATABASE_URL="file:./prisma/dev.db"

# IA
GROQ_API_KEY="tu_api_key_aqui"

# WhatsApp
WHATSAPP_SESSION_PATH="./auth_sessions"

# Servidor
PORT=4000
NODE_ENV=production
ELECTRON_MODE=true
```

### Ubicación de Archivos

**Windows:**
```
C:\Users\[Usuario]\AppData\Local\Smart Sales Bot Pro\
├── .env
├── prisma/
│   └── dev.db
├── auth_sessions/
└── logs/
```

**macOS:**
```
~/Library/Application Support/Smart Sales Bot Pro/
├── .env
├── prisma/
│   └── dev.db
├── auth_sessions/
└── logs/
```

**Linux:**
```
~/.config/smart-sales-bot-pro/
├── .env
├── prisma/
│   └── dev.db
├── auth_sessions/
└── logs/
```

## 🛠️ Funcionalidades Técnicas

### Arquitectura

```
┌─────────────────────────────────────┐
│     Electron Main Process           │
│  (electron/main.js)                 │
│                                     │
│  - Gestión de ventanas              │
│  - Icono de bandeja                 │
│  - Servidor Node.js integrado       │
│  - IPC Communication                │
└─────────────────────────────────────┘
           │
           ├─────────────────────────┐
           │                         │
┌──────────▼──────────┐   ┌─────────▼──────────┐
│  Renderer Process   │   │   Node.js Server   │
│  (Next.js App)      │   │   (server.ts)      │
│                     │   │                    │
│  - Dashboard UI     │   │  - API Routes      │
│  - React Components │   │  - WhatsApp        │
│  - Socket.io Client │   │  - AI Services     │
└─────────────────────┘   └────────────────────┘
```

### Proceso de Inicio

1. **Electron Main** inicia
2. **Servidor Node.js** se ejecuta en background
3. **Next.js** se carga en la ventana
4. **WhatsApp** se conecta automáticamente
5. **Dashboard** queda listo para usar

### Gestión de Procesos

```javascript
// El servidor se ejecuta como proceso hijo
serverProcess = spawn('node', ['server.js']);

// Se reinicia automáticamente si falla
serverProcess.on('close', () => {
  console.log('Servidor cerrado, reiniciando...');
  startServer();
});
```

## 🔒 Seguridad

### Protecciones Implementadas

1. **Context Isolation**: Separación entre main y renderer
2. **Node Integration**: Deshabilitado en renderer
3. **Preload Script**: API controlada y segura
4. **CSP Headers**: Content Security Policy
5. **Encriptación**: Datos sensibles encriptados

### Permisos

La aplicación solicita permisos para:
- ✅ Acceso a red (WhatsApp, APIs)
- ✅ Lectura/escritura de archivos locales
- ✅ Notificaciones del sistema
- ❌ NO requiere permisos de administrador

## 📊 Rendimiento

### Consumo de Recursos

- **RAM**: 150-300 MB (depende de uso)
- **CPU**: 1-5% en reposo, 10-20% activo
- **Disco**: 200-300 MB instalado
- **Red**: Variable según tráfico WhatsApp

### Optimizaciones

- Lazy loading de componentes
- Cache de productos en memoria
- Compresión de imágenes
- Minificación de código
- Tree shaking automático

## 🐛 Solución de Problemas

### La aplicación no inicia

```bash
# Verificar logs
# Windows: %APPDATA%\Smart Sales Bot Pro\logs\
# Mac: ~/Library/Logs/Smart Sales Bot Pro/
# Linux: ~/.config/smart-sales-bot-pro/logs/

# Reinstalar
npm run electron:build:win
```

### Error de puerto ocupado

```bash
# Cambiar puerto en .env
PORT=4001

# O cerrar proceso que usa el puerto
# Windows:
netstat -ano | findstr :4000
taskkill /PID [PID] /F

# Linux/Mac:
lsof -ti:4000 | xargs kill -9
```

### WhatsApp no conecta

1. Eliminar sesión antigua:
   - Ir a carpeta `auth_sessions`
   - Borrar todo el contenido
   - Reiniciar aplicación
   - Escanear QR nuevamente

2. Verificar conexión a internet
3. Verificar que WhatsApp Web funcione en navegador

### Base de datos corrupta

```bash
# Resetear base de datos
npm run db:reset

# O eliminar archivo
# Windows: %APPDATA%\Smart Sales Bot Pro\prisma\dev.db
# Mac: ~/Library/Application Support/Smart Sales Bot Pro/prisma/dev.db
# Linux: ~/.config/smart-sales-bot-pro/prisma/dev.db
```

## 🔄 Actualizaciones

### Actualización Manual

1. Descargar nueva versión
2. Ejecutar instalador
3. Sobrescribe versión anterior
4. Datos se mantienen

### Actualización Automática (Próximamente)

```javascript
// Configurar en electron/main.js
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

## 📝 Desarrollo

### Estructura de Archivos Electron

```
electron/
├── main.js              # Proceso principal
├── preload.js           # Script de precarga
└── resources/           # Recursos (iconos, etc)

scripts/
└── build-electron.js    # Script de construcción

electron-builder.json    # Configuración del builder
```

### Agregar Funcionalidades

```javascript
// En electron/main.js
ipcMain.handle('nueva-funcion', async (event, args) => {
  // Tu código aquí
  return resultado;
});

// En preload.js
contextBridge.exposeInMainWorld('electron', {
  nuevaFuncion: (args) => ipcRenderer.invoke('nueva-funcion', args)
});

// En componente React
const resultado = await window.electron.nuevaFuncion(args);
```

## 🎯 Roadmap

### Versión 1.1 (Próximamente)
- [ ] Actualizaciones automáticas
- [ ] Múltiples cuentas de WhatsApp
- [ ] Modo offline
- [ ] Backup automático

### Versión 1.2
- [ ] Integración con calendario
- [ ] Reportes avanzados
- [ ] Exportación a Excel
- [ ] API REST local

### Versión 2.0
- [ ] Modo multi-tenant
- [ ] Sincronización en la nube
- [ ] App móvil complementaria
- [ ] Integraciones con CRM

## 📞 Soporte

### Recursos
- 📖 Documentación: Ver archivos `.md` en el proyecto
- 🐛 Reportar bugs: GitHub Issues
- 💬 Comunidad: Discord (próximamente)

### Contacto
- Email: soporte@tecnovariedades.com
- WhatsApp: +57 313 617 4267

## 📄 Licencia

Smart Sales Bot Pro Desktop
Copyright © 2025 Tecnovariedades D&S
Todos los derechos reservados.

---

**¡Disfruta de Smart Sales Bot Pro en tu escritorio! 🚀**

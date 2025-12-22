# 🚀 Crear Release en GitHub con Instaladores

## 📋 Pasos para Crear Release

### 1. Construir Instaladores Localmente

```bash
# Ejecutar script de construccion
construir-instalador.bat

# Esperar 10-15 minutos
# Los instaladores estaran en: dist-electron/
```

### 2. Verificar Instaladores Generados

Deberías tener estos archivos en `dist-electron/`:

**Windows:**
- `Smart-Sales-Bot-Pro-1.0.0-x64.exe` (Instalador NSIS)
- `Smart-Sales-Bot-Pro-1.0.0-portable.exe` (Portable)

**macOS:**
- `Smart-Sales-Bot-Pro-1.0.0.dmg`
- `Smart-Sales-Bot-Pro-1.0.0-mac.zip`

**Linux:**
- `Smart-Sales-Bot-Pro-1.0.0.AppImage`
- `Smart-Sales-Bot-Pro-1.0.0.deb`
- `Smart-Sales-Bot-Pro-1.0.0.rpm`

### 3. Crear Release en GitHub

#### Opción A: Desde la Web (RECOMENDADO)

1. **Ir a tu repositorio en GitHub**
   ```
   https://github.com/daveymena/bot-intelogente
   ```

2. **Click en "Releases"** (lado derecho)

3. **Click en "Create a new release"**

4. **Configurar el Release:**
   - **Tag version**: `v1.0.0`
   - **Release title**: `Smart Sales Bot Pro v1.0.0 - Desktop Edition`
   - **Description**: Copiar el texto de abajo

5. **Subir Instaladores:**
   - Arrastrar todos los archivos de `dist-electron/`
   - O click en "Attach binaries" y seleccionar archivos

6. **Click en "Publish release"**

#### Opción B: Desde la Línea de Comandos

```bash
# Instalar GitHub CLI si no lo tienes
# https://cli.github.com/

# Crear release
gh release create v1.0.0 ^
  --title "Smart Sales Bot Pro v1.0.0 - Desktop Edition" ^
  --notes-file RELEASE_NOTES.md ^
  dist-electron/*
```

### 4. Descripción del Release (Copiar esto)

```markdown
# 🎉 Smart Sales Bot Pro v1.0.0 - Desktop Edition

Primera versión oficial de la aplicación de escritorio de Smart Sales Bot Pro.

## ✨ Características

- ✅ Aplicación nativa para Windows, macOS y Linux
- ✅ Servidor Node.js integrado
- ✅ Icono en bandeja del sistema
- ✅ No requiere navegador
- ✅ Notificaciones nativas
- ✅ Inicio automático (opcional)
- ✅ Todas las funcionalidades de la versión web

## 📦 Descargas

### Windows
- **Instalador**: `Smart-Sales-Bot-Pro-1.0.0-x64.exe` (150 MB)
  - Instalación tradicional en Program Files
  - Crea accesos directos
  - Desinstalador incluido
  
- **Portable**: `Smart-Sales-Bot-Pro-1.0.0-portable.exe` (150 MB)
  - No requiere instalación
  - Ejecutar desde USB o carpeta
  - Ideal para pruebas

### macOS
- **DMG**: `Smart-Sales-Bot-Pro-1.0.0.dmg` (150 MB)
  - Instalador estándar de Mac
  - Arrastrar a Applications
  
- **ZIP**: `Smart-Sales-Bot-Pro-1.0.0-mac.zip` (150 MB)
  - Versión comprimida
  - Extraer y ejecutar

### Linux
- **AppImage**: `Smart-Sales-Bot-Pro-1.0.0.AppImage` (150 MB)
  - Ejecutable universal
  - Compatible con todas las distros
  - `chmod +x` y ejecutar
  
- **DEB**: `Smart-Sales-Bot-Pro-1.0.0.deb` (150 MB)
  - Para Debian/Ubuntu
  - `sudo dpkg -i Smart-Sales-Bot-Pro-1.0.0.deb`
  
- **RPM**: `Smart-Sales-Bot-Pro-1.0.0.rpm` (150 MB)
  - Para Fedora/RedHat/CentOS
  - `sudo rpm -i Smart-Sales-Bot-Pro-1.0.0.rpm`

## 🔧 Requisitos del Sistema

- **RAM**: 4 GB mínimo
- **Disco**: 500 MB libres
- **Windows**: 10/11 (64-bit)
- **macOS**: 10.15 o superior
- **Linux**: Ubuntu 18.04+ / Debian 10+

## 📖 Documentación

- [Guía de Instalación](https://github.com/daveymena/bot-intelogente/blob/main/GUIA_ELECTRON_DESKTOP.md)
- [Solución de Problemas](https://github.com/daveymena/bot-intelogente/blob/main/SOLUCION_CONFLICTO_ELECTRON.md)
- [Documentación Completa](https://github.com/daveymena/bot-intelogente/blob/main/README.md)

## 🐛 Reportar Problemas

Si encuentras algún problema, por favor [crea un issue](https://github.com/daveymena/bot-intelogente/issues/new).

## 📞 Soporte

- **WhatsApp**: +57 313 617 4267
- **Email**: soporte@tecnovariedades.com

---

**Fecha de Lanzamiento**: 20 de Noviembre 2025
**Versión**: 1.0.0
**Licencia**: Propietaria - Tecnovariedades D&S
```

### 5. Verificar Release

1. Ir a: `https://github.com/daveymena/bot-intelogente/releases`
2. Verificar que aparezca el release v1.0.0
3. Verificar que todos los instaladores estén disponibles
4. Probar descargar uno para verificar

### 6. Actualizar Enlaces en la Página de Descargas

Los enlaces en `src/app/descargas/page.tsx` ya apuntan a:
```
https://github.com/daveymena/bot-intelogente/releases/latest/download/[archivo]
```

Esto automáticamente descargará la última versión.

## 🎯 Checklist Final

- [ ] Construir instaladores con `construir-instalador.bat`
- [ ] Verificar que todos los instaladores se generaron
- [ ] Probar al menos un instalador localmente
- [ ] Crear release en GitHub
- [ ] Subir todos los instaladores al release
- [ ] Publicar release
- [ ] Verificar que los enlaces de descarga funcionen
- [ ] Probar descargar desde la página `/descargas`
- [ ] Compartir el release en redes sociales

## 📊 Tamaños Aproximados

| Archivo | Tamaño |
|---------|--------|
| Windows NSIS | ~150 MB |
| Windows Portable | ~150 MB |
| macOS DMG | ~150 MB |
| macOS ZIP | ~150 MB |
| Linux AppImage | ~150 MB |
| Linux DEB | ~150 MB |
| Linux RPM | ~150 MB |

**Total**: ~1 GB de instaladores

## 🚀 Automatización Futura

Para automatizar este proceso en el futuro, puedes usar GitHub Actions:

```yaml
# .github/workflows/release.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run electron:build
      - uses: softprops/action-gh-release@v1
        with:
          files: dist-electron/*
```

---

**¡Listo para crear tu primer release! 🎉**

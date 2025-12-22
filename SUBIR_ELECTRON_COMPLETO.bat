@echo off
cls
echo ========================================
echo   SUBIR ELECTRON A GIT
echo ========================================
echo.

echo Agregando archivos de Electron...
git add electron/
git add electron-builder.json
git add ELECTRON_MODO_SIMPLE.bat
git add INICIAR_ELECTRON_AHORA.bat
git add electron-dev.bat
git add iniciar-electron.bat
git add instalar-electron.bat
git add EJECUTAR_ESTO_ELECTRON.bat
git add construir-instalador.bat

echo.
echo Agregando documentacion...
git add GUIA_ELECTRON_DESKTOP.md
git add VERSION_DESKTOP_LISTA.md
git add SOLUCION_CONFLICTO_ELECTRON.md
git add SOLUCION_ERROR_ELECTRON_SERVER.md
git add INSTALAR_ELECTRON_AHORA.md
git add CHECKLIST_FINAL_COMPLETO.md

echo.
echo Agregando scripts...
git add scripts/build-electron.js

echo.
echo Agregando pagina de descargas...
git add src/app/descargas/

echo.
echo Agregando package.json actualizado...
git add package.json

echo.
echo Agregando resumenes finales...
git add RESUMEN_SESION_FINAL_20_NOV_2025.md
git add RESUMEN_FINAL_COMPLETO_20_NOV.md

echo.
echo ========================================
echo   Haciendo Commit
echo ========================================
echo.

git commit -m "feat: version desktop completa con Electron

- Implementar aplicacion Electron con servidor integrado
- Crear instaladores para Windows/Mac/Linux (NSIS, DMG, AppImage, DEB, RPM)
- Agregar icono en bandeja del sistema
- Implementar modo simple con servidor externo
- Crear pagina de descargas en /descargas
- Agregar documentacion completa de Electron
- Resolver conflictos de dependencias con --legacy-peer-deps
- Crear scripts automatizados de instalacion y ejecucion

BREAKING CHANGE: Requiere Electron instalado para version desktop"

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo hacer commit
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Subiendo a GitHub
echo ========================================
echo.

git push origin main

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo hacer push
    echo.
    echo Intenta manualmente:
    echo   git push origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUBIDA EXITOSA!
echo ========================================
echo.
echo Todo el codigo de Electron esta en GitHub
echo.
echo Proximos pasos:
echo   1. Crear release en GitHub
echo   2. Subir instaladores al release
echo   3. Actualizar enlaces en pagina de descargas
echo.

pause

@echo off
cls
echo ========================================
echo   INSTALAR Y PROBAR ELECTRON
echo ========================================
echo.
echo Este script va a:
echo   1. Instalar Electron con --legacy-peer-deps
echo   2. Verificar la instalacion
echo   3. Iniciar la aplicacion en modo desarrollo
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

echo.
echo ========================================
echo   PASO 1: Instalando Electron
echo ========================================
echo.

npm install --save-dev electron@latest electron-builder@latest --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo instalar Electron
    echo.
    echo Intenta manualmente:
    echo   npm cache clean --force
    echo   npm install --save-dev electron electron-builder --legacy-peer-deps
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   PASO 2: Verificando Instalacion
echo ========================================
echo.

call npm list electron
if errorlevel 1 (
    echo.
    echo ADVERTENCIA: Electron puede no estar instalado correctamente
    echo Pero vamos a intentar ejecutarlo de todos modos...
    echo.
)

echo.
echo ========================================
echo   PASO 3: Iniciando Aplicacion
echo ========================================
echo.
echo La aplicacion se abrira en unos segundos...
echo Si ves el dashboard, todo funciona correctamente!
echo.
echo Presiona Ctrl+C para detener cuando termines de probar.
echo.

timeout /t 3 >nul

set NODE_ENV=development
npx electron .

echo.
echo ========================================
echo   Aplicacion Cerrada
echo ========================================
echo.
echo Si funciono correctamente, puedes:
echo   - Ejecutar: npm run electron:dev (para desarrollo)
echo   - Ejecutar: construir-instalador.bat (para crear instaladores)
echo.

pause

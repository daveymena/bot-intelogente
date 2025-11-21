@echo off
echo ========================================
echo   Construir Instalador de Escritorio
echo ========================================
echo.

echo Este proceso puede tardar varios minutos...
echo.

echo [1/4] Verificando dependencias de Electron...
call npm list electron >nul 2>&1
if errorlevel 1 (
    echo Instalando Electron...
    npm install --save-dev electron electron-builder --legacy-peer-deps
) else (
    echo Electron ya instalado.
)

echo.
echo [2/4] Construyendo aplicacion Next.js...
call npm run build
if errorlevel 1 (
    echo Error en build de Next.js
    pause
    exit /b 1
)

echo.
echo [3/4] Compilando servidor...
call npm run build:server
if errorlevel 1 (
    echo Error en build del servidor
    pause
    exit /b 1
)

echo.
echo [4/4] Creando instaladores...
node scripts/build-electron.js
if errorlevel 1 (
    echo Error creando instaladores
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Completado!
echo ========================================
echo.
echo Los instaladores estan en: dist-electron/
echo.
dir dist-electron /b
echo.

pause

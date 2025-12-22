@echo off
cls
echo ========================================
echo   ELECTRON - Modo Simple
echo ========================================
echo.
echo Este modo inicia el servidor por separado
echo y luego abre Electron.
echo.

REM Verificar puerto 4000
netstat -ano | findstr :4000 >nul 2>&1
if not errorlevel 1 (
    echo El puerto 4000 ya esta en uso.
    echo Cerrando proceso...
    call cerrar-puerto-4000.bat
    timeout /t 2 >nul
)

echo [1/2] Iniciando servidor en segundo plano...
start /B "Smart Sales Bot Server" cmd /c "npx tsx server.ts > server-electron.log 2>&1"

echo Esperando a que el servidor inicie...
timeout /t 5 >nul

REM Verificar que el servidor este corriendo
netstat -ano | findstr :4000 >nul 2>&1
if errorlevel 1 (
    echo ERROR: El servidor no inicio correctamente
    echo Revisa server-electron.log para mas detalles
    pause
    exit /b 1
)

echo [OK] Servidor corriendo en puerto 4000
echo.

echo [2/2] Iniciando Electron...
set NODE_ENV=development
set SERVER_EXTERNAL=true
npx electron electron/main-simple.js

echo.
echo Cerrando servidor...
taskkill /FI "WINDOWTITLE eq Smart Sales Bot Server*" /F >nul 2>&1

echo.
echo ========================================
echo   Aplicacion Cerrada
echo ========================================
echo.

pause

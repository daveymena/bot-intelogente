@echo off
echo ========================================
echo   Smart Sales Bot Pro - Electron Dev
echo ========================================
echo.

echo Verificando que el servidor este disponible...
if not exist "server.ts" (
    echo ERROR: No se encuentra server.ts
    pause
    exit /b 1
)

echo.
echo Iniciando aplicacion Electron...
echo (El servidor se iniciara automaticamente)
echo.

set NODE_ENV=development
npx electron .

pause

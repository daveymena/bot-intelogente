@echo off
echo ========================================
echo   Smart Sales Bot Pro - Electron
echo ========================================
echo.

echo Iniciando aplicacion de escritorio...
echo (El servidor se iniciara automaticamente)
echo.

set NODE_ENV=development
npx electron .

pause

@echo off
echo ========================================
echo   Instalar Electron - Smart Sales Bot
echo ========================================
echo.

echo Instalando dependencias de Electron...
echo (Usando --legacy-peer-deps para resolver conflictos)
echo.

npm install --save-dev electron@latest electron-builder@latest --legacy-peer-deps

echo.
echo ========================================
echo   Instalacion Completada!
echo ========================================
echo.
echo Ahora puedes ejecutar:
echo   - npm run electron:dev (modo desarrollo)
echo   - construir-instalador.bat (crear instaladores)
echo.

pause

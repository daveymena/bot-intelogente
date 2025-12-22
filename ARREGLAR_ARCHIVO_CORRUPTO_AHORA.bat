@echo off
echo.
echo ========================================
echo   ARREGLANDO ARCHIVO CORRUPTO
echo ========================================
echo.
echo El archivo baileys-stable-service.ts esta corrupto
echo Vamos a restaurarlo y aplicar el fix correctamente
echo.
pause

node fix-baileys-corrupto-final.js

echo.
echo ========================================
echo   LISTO - Reinicia el servidor
echo ========================================
echo.
echo Ejecuta: npm run dev
echo.
pause

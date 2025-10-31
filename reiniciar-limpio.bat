@echo off
echo ========================================
echo   REINICIO LIMPIO - WHATSAPP BOT
echo ========================================
echo.
echo Este script:
echo 1. Detiene el servidor
echo 2. Limpia cache de Next.js
echo 3. Reinicia el servidor
echo.
echo ========================================
echo.

echo Limpiando cache de Next.js...
if exist .next rmdir /s /q .next
echo Cache limpiado.
echo.

echo Iniciando servidor...
echo.
npm run dev

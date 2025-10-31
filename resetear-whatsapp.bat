@echo off
echo ========================================
echo   RESETEAR CONEXION DE WHATSAPP
echo ========================================
echo.
echo Este script resetea el estado de la
echo conexion de WhatsApp en la base de datos.
echo.
echo Util cuando el estado se queda en CONNECTING
echo o hay algun problema con la conexion.
echo.
echo ========================================
echo.

npx tsx scripts/reset-whatsapp-connection.ts

echo.
echo ========================================
echo.
echo Ahora refresca el navegador y prueba
echo conectar de nuevo.
echo.
pause

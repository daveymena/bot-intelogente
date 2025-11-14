@echo off
echo ========================================
echo   ARREGLAR CONEXION WHATSAPP
echo ========================================
echo.
echo Este script actualizara el estado de conexion
echo de WhatsApp a CONNECTED
echo.
pause

npx tsx scripts/arreglar-conexion-whatsapp.ts

echo.
echo ========================================
echo   CONEXION ARREGLADA
echo ========================================
echo.
echo Proximos pasos:
echo 1. Reinicia el servidor (npm run dev)
echo 2. Verifica el dashboard
echo 3. Envia un mensaje de prueba
echo.
pause

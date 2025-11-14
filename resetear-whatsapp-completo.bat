@echo off
echo ========================================
echo   RESETEAR WHATSAPP COMPLETO
echo ========================================
echo.
echo ADVERTENCIA: Esto eliminara toda la conexion
echo de WhatsApp y tendras que escanear el QR
echo de nuevo.
echo.
pause

npx tsx scripts/resetear-whatsapp-completo.ts

echo.
echo ========================================
pause

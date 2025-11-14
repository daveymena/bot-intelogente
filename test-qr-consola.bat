@echo off
echo ============================================================
echo TEST DE GENERACION DE QR POR CONSOLA
echo ============================================================
echo.

echo Este script va a:
echo - Generar un QR de WhatsApp
echo - Mostrarlo en la consola
echo - Detectar errores
echo.
echo Espera 30 segundos para ver el resultado...
echo.

npx tsx scripts/test-qr-console.ts

echo.
echo ============================================================
echo Test completado
echo ============================================================
echo.

pause

@echo off
echo ============================================================
echo DIAGNOSTICO Y TEST DE QR - TODO EN UNO
echo ============================================================
echo.

echo Este script va a ejecutar:
echo 1. Diagnostico completo del sistema
echo 2. Test de generacion de QR
echo 3. Verificacion de estado en DB
echo.
echo Puede tomar hasta 2 minutos...
echo.

npx tsx scripts/diagnostico-y-test-qr.ts

echo.
echo ============================================================
echo Proceso completado
echo ============================================================
echo.

pause

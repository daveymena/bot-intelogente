@echo off
echo ========================================
echo   TEST: Confirmacion de Pago y Memoria
echo ========================================
echo.
echo Probando deteccion de confirmaciones...
echo.

npx tsx scripts/test-confirmacion-pago.ts

echo.
echo ========================================
echo   Test completado
echo ========================================
pause

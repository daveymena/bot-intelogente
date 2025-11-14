@echo off
echo ========================================
echo   PROBAR TODOS LOS METODOS DE PAGO
echo ========================================
echo.

echo Probando diferentes formas de pedir metodos de pago...
echo.

npx tsx scripts/test-todos-metodos-pago.ts

echo.
echo ========================================
pause

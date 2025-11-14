@echo off
cls
echo ========================================
echo   TEST: Contexto de Producto Correcto
echo ========================================
echo.
echo Verificando que el bot mantiene el
echo producto correcto durante todo el
echo proceso de pago...
echo.
echo ========================================
echo.

npx tsx scripts/test-contexto-producto-correcto.ts

echo.
echo ========================================
pause

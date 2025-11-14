@echo off
echo ========================================
echo TEST: Generacion de Links de Pago
echo ========================================
echo.
echo Este script verifica:
echo - Configuracion de MercadoPago y PayPal
echo - Generacion de links reales
echo - Formato del mensaje
echo.
pause

npx tsx scripts/test-generacion-links-pago.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause

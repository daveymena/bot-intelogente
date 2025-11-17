@echo off
echo ========================================
echo TEST: Links de Pago (MercadoPago y PayPal)
echo ========================================
echo.
echo Verificando que los links se generen correctamente
echo y se muestren en los mensajes...
echo.
pause

npx tsx scripts/test-payment-links.ts

echo.
echo ========================================
echo Test completado
echo ========================================
echo.
echo Si ves links de MercadoPago y PayPal arriba,
echo el sistema esta funcionando correctamente.
echo.
pause

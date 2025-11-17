@echo off
echo ========================================
echo ARREGLAR LINK DE PAYPAL
echo ========================================
echo.
echo Este script corregira el formato del link
echo de PayPal para que funcione correctamente
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

powershell -ExecutionPolicy Bypass -File corregir-paypal-link.ps1

echo.
echo ========================================
echo Correccion completada
echo ========================================
echo.
echo IMPORTANTE:
echo 1. Configura PAYPAL_ME_USERNAME en .env
echo 2. Reinicia el bot: npm run dev
echo 3. Prueba en WhatsApp
echo.
pause

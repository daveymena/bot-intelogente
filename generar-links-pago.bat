@echo off
echo.
echo ========================================
echo   GENERADOR DE LINKS DE PAGO
echo ========================================
echo.
echo Este script genera y guarda los links
echo de pago para todos los productos.
echo.
echo Ventajas:
echo  - Respuesta instantanea (sin esperar API)
echo  - Menos llamadas a APIs de pago
echo  - Auto-regeneracion si cambia el precio
echo.
echo ========================================
echo.

npx tsx scripts/generar-links-pago-productos.ts

echo.
pause

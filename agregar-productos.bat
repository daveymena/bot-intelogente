@echo off
echo ========================================
echo   AGREGAR PRODUCTOS DE EJEMPLO
echo ========================================
echo.
echo Este script agrega 8 productos de ejemplo
echo a tu base de datos para que el bot pueda
echo recomendar y vender.
echo.
echo Productos que se agregaran:
echo - Laptop HP 15.6" - $599.99
echo - Laptop Dell Inspiron - $749.99
echo - Mouse Inalambrico Logitech - $29.99
echo - Teclado Mecanico RGB - $89.99
echo - Monitor 24" Full HD - $149.99
echo - Audifonos Bluetooth Sony - $199.99
echo - Webcam HD 1080p - $49.99
echo - Disco Duro Externo 1TB - $59.99
echo.
echo ========================================
echo.

npx tsx scripts/seed-products.ts

echo.
echo ========================================
echo.
echo Ahora puedes probar el bot enviando:
echo "Que productos tienes?"
echo.
pause

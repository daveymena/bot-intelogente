@echo off
echo ========================================
echo RESTAURACION DE PRODUCTOS CON FOTOS
echo ========================================
echo.

echo [1/2] Restaurando productos...
npx tsx restaurar-productos-con-fotos.js

echo.
echo [2/2] Probando eliminacion...
npx tsx test-eliminacion-productos.js

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Ahora puedes:
echo 1. Abrir el dashboard
echo 2. Ir a Productos
echo 3. Verificar que el Curso de Piano tiene fotos
echo 4. Probar eliminar un producto
echo.
pause

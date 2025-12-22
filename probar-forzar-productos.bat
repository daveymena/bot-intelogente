@echo off
echo ========================================
echo  TEST: FORZAR CARGA DE TODOS PRODUCTOS
echo ========================================
echo.
echo Este test va a:
echo 1. Cargar TODOS los productos de la BD
echo 2. Mostrar la lista completa
echo 3. Probar busquedas con todos los productos
echo.
echo Esto puede tardar varios minutos...
echo.

npx tsx scripts/test-forzar-todos-productos.ts

echo.
echo ========================================
echo  TEST COMPLETADO
echo ========================================
pause

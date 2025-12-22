@echo off
echo ========================================
echo TEST: BUSQUEDA SIMPLE DE PRODUCTOS
echo ========================================
echo.
echo Este script verifica que la busqueda
echo de productos funcione correctamente
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

npx tsx scripts/test-busqueda-simple.ts

echo.
echo ========================================
echo Test completado
echo ========================================
pause

@echo off
echo ========================================
echo   LISTAR PRODUCTOS SIN IMAGEN REAL
echo ========================================
echo.
echo Este script muestra que productos
echo aun no tienen imagen real.
echo.
echo ========================================
echo.

npx tsx scripts/actualizar-imagenes.ts listar

echo.
pause

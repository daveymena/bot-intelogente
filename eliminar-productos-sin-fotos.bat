@echo off
echo ========================================
echo   ELIMINAR PRODUCTOS SIN FOTOS
echo ========================================
echo.
echo Este script eliminara PERMANENTEMENTE
echo todos los productos que no tengan imagenes
echo.
echo Tienes 5 segundos para cancelar (Ctrl+C)
echo.

npx tsx scripts/eliminar-productos-sin-fotos.ts

echo.
echo ========================================
pause

@echo off
echo ========================================
echo   ELIMINAR PRODUCTOS DUPLICADOS
echo ========================================
echo.

echo ADVERTENCIA: Este script eliminara productos duplicados
echo Mantendra el producto mas reciente de cada duplicado
echo.
echo Presiona Ctrl+C para cancelar o
pause

echo.
echo Ejecutando limpieza de duplicados...
echo.

npx tsx scripts/eliminar-productos-duplicados.ts

echo.
echo ========================================
echo   PROCESO COMPLETADO
echo ========================================
echo.
pause

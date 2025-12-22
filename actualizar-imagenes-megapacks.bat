@echo off
echo ========================================
echo   ACTUALIZAR IMAGENES DE MEGAPACKS
echo ========================================
echo.
echo Este script actualiza las imagenes de
echo todos los megapacks individuales.
echo.
echo IMPORTANTE: Primero debes subir las
echo imagenes y agregar las URLs en el script.
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
echo.

npx tsx scripts/actualizar-imagenes-megapacks.ts

echo.
echo ========================================
echo   ACTUALIZACION COMPLETADA
echo ========================================
pause

@echo off
echo ========================================
echo  ACTUALIZAR FOTOS - TODOS los productos
echo ========================================
echo.
echo ADVERTENCIA: Este proceso puede tardar mucho tiempo
echo Actualizara las fotos de TODOS los productos en la base de datos
echo.
pause

npx tsx scripts/scraper-fotos-todas-tiendas.ts todos

echo.
echo ========================================
echo  Proceso completado!
echo ========================================
pause

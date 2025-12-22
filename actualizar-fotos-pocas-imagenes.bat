@echo off
echo ========================================
echo  ACTUALIZAR FOTOS - Productos con pocas fotos
echo ========================================
echo.
echo Este script buscara mas fotos para productos que tienen menos de 2 imagenes
echo.
pause

npx tsx scripts/scraper-fotos-todas-tiendas.ts pocas-fotos

echo.
echo ========================================
echo  Proceso completado!
echo ========================================
pause

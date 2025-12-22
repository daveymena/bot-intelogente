@echo off
echo ========================================
echo  ACTUALIZAR FOTOS - Productos sin fotos
echo ========================================
echo.
echo Este script buscara fotos para productos que no tienen imagenes
echo.
pause

npx tsx scripts/scraper-fotos-todas-tiendas.ts sin-fotos

echo.
echo ========================================
echo  Proceso completado!
echo ========================================
pause

@echo off
echo ========================================
echo RECLASIFICAR PRODUCTOS Y AGREGAR FOTOS
echo ========================================
echo.
echo Este script va a:
echo 1. Identificar CURSOS vs MEGAPACKS
echo 2. Agregar fotos a TODOS los productos
echo.
pause

npx tsx scripts/reclasificar-y-agregar-fotos.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

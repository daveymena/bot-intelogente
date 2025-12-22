@echo off
echo ========================================
echo LIMPIEZA Y ACTUALIZACION DE PRODUCTOS
echo ========================================
echo.

echo [1/3] Asignando imagenes a productos...
call npx tsx scripts/limpiar-y-asignar-imagenes.ts
echo.

echo [2/3] Eliminando productos duplicados...
call npx tsx scripts/eliminar-duplicados.ts
echo.

echo [3/3] Actualizando base de datos...
call npx tsx scripts/actualizar-productos-con-imagenes.ts
echo.

echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

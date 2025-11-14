@echo off
echo ========================================
echo   ACTUALIZAR IMAGENES DE PRODUCTOS
echo ========================================
echo.
echo Este script actualiza las imagenes de
echo los productos con URLs reales.
echo.
echo ANTES DE EJECUTAR:
echo 1. Sube tus imagenes a ImgBB o Imgur
echo 2. Edita: scripts/actualizar-imagenes.ts
echo 3. Agrega las URLs en el objeto imagenesProductos
echo.
echo ========================================
echo.

npx tsx scripts/actualizar-imagenes.ts

echo.
pause

@echo off
echo ========================================
echo   ACTUALIZAR MIS PRODUCTOS
echo ========================================
echo.
echo Actualizando 86 productos con:
echo   - Imagenes de SmartJoys
echo   - Categorias automaticas
echo   - Tags relevantes
echo.
echo Esto puede tomar 5-10 minutos...
echo.

npx tsx scripts/actualizar-productos-con-imagenes.ts

echo.
echo ========================================
pause

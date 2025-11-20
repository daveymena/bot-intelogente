@echo off
echo ========================================
echo   IMPORTAR PRODUCTOS DE SMARTJOYS
echo ========================================
echo.
echo Importando productos desde productos-dropshipping.json
echo Con margen de ganancia del 20%%
echo.

npx tsx scripts/importar-smartjoys.ts

echo.
echo ========================================
echo   IMPORTACION COMPLETADA
echo ========================================
echo.
pause

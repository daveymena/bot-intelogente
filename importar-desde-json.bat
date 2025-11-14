@echo off
echo ========================================
echo   IMPORTAR PRODUCTOS DESDE JSON
echo ========================================
echo.
echo Este script importara productos desde:
echo catalogo-completo-68-productos.json
echo.
pause

npx tsx scripts/importar-desde-json.ts

echo.
echo ========================================
echo   IMPORTACION COMPLETADA
echo ========================================
pause

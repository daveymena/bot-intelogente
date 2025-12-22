@echo off
echo ========================================
echo   IMPORTAR PRODUCTOS DE MEGACOMPUTER
echo ========================================
echo.
echo Este script importara los productos desde:
echo productos-megacomputer-completo.json
echo.
pause

npx tsx scripts/importar-megacomputer-completo.ts

echo.
echo ========================================
echo   IMPORTACION COMPLETADA
echo ========================================
pause

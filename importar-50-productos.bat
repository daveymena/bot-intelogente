@echo off
echo ========================================
echo   IMPORTAR 50 PRODUCTOS COMPLETOS
echo ========================================
echo.
echo Importando productos desde productos-completos.json...
echo.

npx tsx scripts/importar-50-productos-completo.ts

echo.
echo ========================================
echo   IMPORTACION COMPLETADA
echo ========================================
echo.
pause

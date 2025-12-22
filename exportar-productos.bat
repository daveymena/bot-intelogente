@echo off
echo ========================================
echo   EXPORTAR PRODUCTOS A JSON Y EXCEL
echo ========================================
echo.
echo Este script exportara todos los productos de la BD a:
echo - catalogo-completo-68-productos.json
echo - catalogo-completo-68-productos.csv
echo.
pause

npx tsx scripts/exportar-productos-completo.ts

echo.
echo ========================================
echo   ARCHIVOS CREADOS
echo ========================================
echo.
echo Ubicacion: %CD%
echo.
dir /B catalogo-completo-68-productos.*
echo.
echo Puedes abrir el CSV en Excel para editarlo
echo.
pause

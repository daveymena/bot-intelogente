@echo off
echo ========================================
echo 🔍 VERIFICANDO PRECIOS DEL CATALOGO
echo ========================================
echo.
echo Este script muestra los precios REALES
echo de los productos en la base de datos.
echo.
echo El bot DEBE usar SOLO estos precios.
echo.
pause

echo.
echo 🔍 Consultando base de datos...
echo.

npx tsx scripts/verificar-precios-productos.ts

echo.
pause

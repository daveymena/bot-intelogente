@echo off
echo ========================================
echo RESTAURAR FOTOS REALES DE PRODUCTOS
echo ========================================
echo.
echo Este script va a:
echo 1. Leer el archivo JSON con fotos originales
echo 2. Actualizar productos con sus fotos reales
echo 3. Mantener fotos de scrapers (MegaComputer, etc.)
echo.
pause

npx tsx scripts/restaurar-fotos-reales.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

@echo off
echo ========================================
echo ACTUALIZAR MEGACOMPUTER
echo ========================================
echo.
echo 1. Scrapear productos de MegaComputer
echo 2. Importar a base de datos
echo.
echo Tiempo estimado: 30-45 minutos
echo.
timeout /t 3
echo.

echo Scrapeando e importando MegaComputer...
npx tsx scripts/re-importar-megacomputer.ts

echo.
echo ========================================
echo MEGACOMPUTER ACTUALIZADO
echo ========================================
echo.
pause

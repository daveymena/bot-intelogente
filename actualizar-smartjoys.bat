@echo off
echo ========================================
echo ACTUALIZAR SMARTJOYS
echo ========================================
echo.
echo 1. Scrapear productos de SmartJoys
echo 2. Importar a base de datos
echo.
echo Tiempo estimado: 10-15 minutos
echo.
timeout /t 3
echo.

echo Paso 1: Scrapeando SmartJoys...
npx tsx scripts/scrape-smartjoys-final.ts

echo.
echo Paso 2: Importando a base de datos...
npx tsx scripts/importar-smartjoys.ts

echo.
echo ========================================
echo SMARTJOYS ACTUALIZADO
echo ========================================
echo.
pause

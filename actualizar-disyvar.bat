@echo off
echo ========================================
echo ACTUALIZAR DISYVAR
echo ========================================
echo.
echo 1. Scrapear productos de Disyvar
echo 2. Importar a base de datos
echo.
echo Tiempo estimado: 20-30 minutos
echo.
timeout /t 3
echo.

echo Paso 1: Scrapeando Disyvar...
npx tsx scripts/scrape-disyvar.ts

echo.
echo Paso 2: Importando a base de datos...
npx tsx scripts/import-disyvar.ts

echo.
echo ========================================
echo DISYVAR ACTUALIZADO
echo ========================================
echo.
pause

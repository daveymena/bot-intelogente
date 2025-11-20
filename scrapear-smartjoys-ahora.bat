@echo off
echo ========================================
echo   SCRAPEAR PRODUCTOS DE SMARTJOYS
echo ========================================
echo.
echo Extrayendo productos de https://smartjoys.co/tienda/
echo.
echo Este proceso puede tomar varios minutos...
echo.

npx tsx scripts/scrape-smartjoys-final.ts

echo.
echo ========================================
echo   SCRAPING COMPLETADO
echo ========================================
echo.
echo Los productos se guardaron en:
echo scripts/productos-dropshipping.json
echo.
echo Para importarlos a la base de datos:
echo npm run import:dropshipping
echo.
pause

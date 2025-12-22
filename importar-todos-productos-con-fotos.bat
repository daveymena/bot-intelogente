@echo off
echo ========================================
echo IMPORTACION COMPLETA DE PRODUCTOS CON FOTOS
echo ========================================
echo.

echo [1/5] Scrapeando MegaComputer...
echo ----------------------------------------
node scripts/scraper-megacomputer-completo.js
if errorlevel 1 (
    echo ERROR: Fallo el scraping de MegaComputer
    pause
    exit /b 1
)
echo.

echo [2/5] Importando productos MegaComputer a BD...
echo ----------------------------------------
npx tsx scripts/importar-megacomputer-db.ts
if errorlevel 1 (
    echo ERROR: Fallo la importacion de MegaComputer
    pause
    exit /b 1
)
echo.

echo [3/5] Importando productos Disyvar (Dropshipping)...
echo ----------------------------------------
node importar-dropshipping-disyvar.js
if errorlevel 1 (
    echo ERROR: Fallo la importacion de Disyvar
    pause
    exit /b 1
)
echo.

echo [4/5] Scrapeando SmartJoys...
echo ----------------------------------------
npx tsx scripts/scrape-smartjoys-final.ts
if errorlevel 1 (
    echo ERROR: Fallo el scraping de SmartJoys
    pause
    exit /b 1
)
echo.

echo [5/5] Importando productos SmartJoys a BD...
echo ----------------------------------------
npx tsx scripts/importar-smartjoys-db.ts
if errorlevel 1 (
    echo ERROR: Fallo la importacion de SmartJoys
    pause
    exit /b 1
)
echo.

echo ========================================
echo PROCESO COMPLETADO EXITOSAMENTE
echo ========================================
echo.
echo Productos importados:
echo - MegaComputer: ~50-100 productos fisicos
echo - Disyvar: 30 productos dropshipping
echo - SmartJoys: ~30 productos dropshipping
echo.
echo TOTAL: ~110-160 productos con fotos reales
echo.
echo Presiona cualquier tecla para salir...
pause > nul

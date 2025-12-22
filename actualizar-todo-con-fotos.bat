@echo off
echo ========================================
echo ACTUALIZACION COMPLETA DE PRODUCTOS
echo ========================================
echo.
echo Este proceso va a:
echo.
echo 1. Re-scrapear productos sin fotos
echo 2. Re-importar MegaComputer
echo 3. Actualizar SmartJoys
echo 4. Actualizar Disyvar
echo.
echo Tiempo estimado: 1-2 horas
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 10
echo.

echo.
echo ========================================
echo PASO 1: PRODUCTOS SIN FOTOS
echo ========================================
echo.
call re-scrapear-fotos-ahora.bat

echo.
echo ========================================
echo PASO 2: MEGACOMPUTER
echo ========================================
echo.
call re-importar-megacomputer-ahora.bat

echo.
echo ========================================
echo PASO 3: SMARTJOYS
echo ========================================
echo.
npx tsx scripts/scrape-smartjoys-final.ts
npx tsx scripts/importar-smartjoys.ts

echo.
echo ========================================
echo PASO 4: DISYVAR
echo ========================================
echo.
npx tsx scripts/scrape-disyvar.ts
npx tsx scripts/import-disyvar.ts

echo.
echo ========================================
echo PROCESO COMPLETO FINALIZADO
echo ========================================
echo.
echo Revisa el dashboard para ver los productos actualizados
echo http://localhost:3000/dashboard
echo.
pause

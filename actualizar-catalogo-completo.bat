@echo off
echo ========================================
echo ACTUALIZAR CATALOGO COMPLETO
echo ========================================
echo.
echo Este proceso va a:
echo.
echo 1. Scrapear SmartJoys (20-30 productos)
echo 2. Scrapear Disyvar (100-200 productos)
echo 3. Scrapear MegaComputer (50-100 productos)
echo 4. Importar todo a la base de datos
echo.
echo Tiempo estimado: 1-2 horas
echo.
echo IMPORTANTE:
echo - Mantener conexion a internet estable
echo - No cerrar esta ventana
echo - El proceso continua aunque falle una tienda
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 10
echo.

npx tsx scripts/actualizar-catalogo-completo.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
echo Abre el dashboard para ver los productos:
echo http://localhost:3000/dashboard
echo.
pause

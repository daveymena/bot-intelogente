@echo off
echo ========================================
echo RE-SCRAPEAR Y ACTUALIZAR FOTOS
echo ========================================
echo.
echo Este script va a:
echo 1. Buscar productos sin fotos
echo 2. Re-scrapear de sus tiendas originales
echo 3. Actualizar la base de datos
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 5
echo.

npx tsx scripts/re-scrapear-y-actualizar-fotos.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
pause

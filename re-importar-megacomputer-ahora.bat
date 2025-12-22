@echo off
echo ========================================
echo RE-IMPORTAR MEGACOMPUTER CON FOTOS
echo ========================================
echo.
echo Este script va a:
echo 1. Scrapear productos de MegaComputer
echo 2. Extraer todas las fotos
echo 3. Actualizar/Crear en base de datos
echo.
echo Tiempo estimado: 15-30 minutos
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 5
echo.

npx tsx scripts/re-importar-megacomputer.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
pause

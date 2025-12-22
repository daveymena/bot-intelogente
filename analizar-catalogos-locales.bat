@echo off
echo ========================================
echo ANALIZAR CATALOGOS LOCALES
echo ========================================
echo.
echo Este script va a:
echo 1. Buscar archivos JSON/CSV en C:\catalogos
echo 2. Analizar productos y fotos reales
echo 3. Actualizar base de datos con fotos reales
echo.
echo IMPORTANTE:
echo - Solo usa fotos REALES (no Unsplash)
echo - Busca productos por nombre en BD
echo - Actualiza solo si encuentra coincidencias
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 5
echo.

npx tsx scripts/analizar-catalogos-locales.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
pause

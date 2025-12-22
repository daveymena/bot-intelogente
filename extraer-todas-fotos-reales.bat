@echo off
echo ========================================
echo EXTRAER TODAS LAS FOTOS REALES
echo ========================================
echo.
echo Este script va a:
echo 1. Buscar en TODOS los archivos JSON
echo 2. Extraer fotos reales (no Unsplash)
echo 3. Actualizar productos en la base de datos
echo 4. Reemplazar fotos genéricas con reales
echo.
pause

npx tsx scripts/extraer-todas-fotos-reales.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
pause

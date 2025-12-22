@echo off
echo ========================================
echo   ACTUALIZAR MEGAPACKS AUTOMATICO
echo ========================================
echo.
echo Este script:
echo 1. Busca la imagen mas comun
echo 2. Actualiza TODOS los megapacks de 20,000
echo 3. Usa la imagen mas comun encontrada
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
echo.

npx tsx scripts/encontrar-y-actualizar-megapacks.ts

echo.
echo ========================================
echo   ACTUALIZACION COMPLETADA
echo ========================================
echo.
echo Verifica en: http://localhost:3000/tienda
echo.
pause

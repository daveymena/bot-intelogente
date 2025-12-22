@echo off
echo ========================================
echo   VERIFICACION MEGAPACKS COMPLETOS
echo ========================================
echo.
echo Verificando que todos los 40 megapacks esten en la BD...
echo.
npx tsx scripts/test-busqueda-megapacks.ts
echo.
echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
pause

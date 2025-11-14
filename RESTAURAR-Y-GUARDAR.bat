@echo off
echo ========================================
echo   RESTAURAR CODIGO Y GUARDAR EN GIT
echo ========================================
echo.
echo Este script:
echo 1. Restaura el codigo que el autofix elimino
echo 2. Lo guarda en Git inmediatamente
echo 3. Asi no se pierde el trabajo
echo.
pause

echo.
echo [1/3] Restaurando imports criticos...
npx tsx scripts/restaurar-
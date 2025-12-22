@echo off
echo ========================================
echo   VERIFICAR PRODUCTOS DUPLICADOS
echo ========================================
echo.

echo Buscando productos duplicados en la base de datos...
echo.

npx tsx scripts/verificar-productos-duplicados.ts

echo.
echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
echo.
pause

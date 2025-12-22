@echo off
echo ========================================
echo   IMPORTAR PRODUCTOS CON IMAGENES
echo ========================================
echo.
echo Solo importara productos que tengan imagenes
echo y omitira los duplicados
echo.
pause
echo.
npx tsx scripts/importar-productos-con-imagenes.ts
echo.
pause

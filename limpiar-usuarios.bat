@echo off
echo ========================================
echo   LIMPIAR USUARIOS (Excepto Admin)
echo ========================================
echo.
echo Este script eliminara TODOS los usuarios
echo excepto: daveymena16@gmail.com
echo.
pause
echo.
echo Ejecutando limpieza...
npx tsx scripts/limpiar-usuarios-excepto-admin.ts
echo.
pause

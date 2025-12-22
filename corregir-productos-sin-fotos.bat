@echo off
echo ========================================
echo CORREGIR PRODUCTOS SIN FOTOS
echo ========================================
echo.
echo Este script va a:
echo 1. Buscar productos sin fotos en BD
echo 2. Leer archivos JSON en C:\catalogos
echo 3. Actualizar productos con sus fotos
echo.
echo Presiona Ctrl+C para cancelar...
timeout /t 3
echo.

npx tsx scripts/corregir-productos-sin-fotos.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
echo Verifica en el dashboard:
echo http://localhost:3000/dashboard
echo.
pause

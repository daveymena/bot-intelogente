@echo off
echo.
echo ========================================
echo   LIMPIEZA DE SESION WHATSAPP
echo ========================================
echo.
echo Ejecutando diagnostico y limpieza...
echo.

npx tsx scripts/test-session-cleanup.ts

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
pause

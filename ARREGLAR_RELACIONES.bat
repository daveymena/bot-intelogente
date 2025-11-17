@echo off
echo ========================================
echo   ARREGLANDO RELACIONES EN SCHEMA
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File agregar-relaciones-schema.ps1

echo.
echo ========================================
echo   PROBANDO SISTEMA
echo ========================================
echo.

call npx tsx scripts/test-notification-system.ts

echo.
pause

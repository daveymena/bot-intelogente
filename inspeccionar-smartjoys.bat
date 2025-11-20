@echo off
echo ========================================
echo   INSPECCIONAR ESTRUCTURA SMARTJOYS
echo ========================================
echo.
echo Analizando https://smartjoys.co/
echo.
echo Se abrira un navegador para inspeccion...
echo El navegador permanecera abierto para revision manual
echo.
echo Presiona Ctrl+C cuando termines de revisar
echo.

npx tsx scripts/inspeccionar-smartjoys.ts

pause

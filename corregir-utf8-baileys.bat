@echo off
echo ========================================
echo   CORRIGIENDO CODIFICACION UTF-8
echo ========================================
echo.

echo Cerrando procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Ejecutando script de correccion...
powershell -ExecutionPolicy Bypass -File corregir-utf8-baileys.ps1

pause

@echo off
:loop
cls
echo ========================================
echo   MONITOR DE WHATSAPP - Smart Sales Bot
echo ========================================
echo.
node verificar-estado-whatsapp.js
echo.
echo Presiona Ctrl+C para salir
echo Actualizando en 30 segundos...
timeout /t 30 /nobreak > nul
goto loop

@echo off
echo ========================================
echo   TEST: CAMBIO AUTOMATICO DE MODELOS
echo ========================================
echo.
echo Este test verifica que el bot cambie
echo automaticamente de modelo cuando hay
echo rate limits, SIN intervencion humana.
echo.
echo Presiona cualquier tecla para iniciar...
pause > nul

node test-auto-model-switch.js

echo.
echo ========================================
echo   TEST COMPLETADO
echo ========================================
echo.
echo El sistema ahora:
echo - Detecta rate limits automaticamente
echo - Cambia de modelo sin ayuda humana
echo - Funciona 24/7 sin supervision
echo.
pause

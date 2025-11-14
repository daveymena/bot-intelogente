@echo off
echo ========================================
echo   TEST DE CONOCIMIENTO EXTERNO
echo ========================================
echo.
echo Este test verifica que el bot pueda:
echo 1. Buscar informacion tecnica real
echo 2. Responder preguntas especificas
echo 3. NO inventar especificaciones
echo.
echo Presiona cualquier tecla para iniciar...
pause > nul
echo.

npx tsx test-conocimiento-externo.js

echo.
echo ========================================
echo   TEST COMPLETADO
echo ========================================
pause

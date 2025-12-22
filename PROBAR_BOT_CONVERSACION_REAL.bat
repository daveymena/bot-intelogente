@echo off
cls
echo.
echo ========================================
echo   TEST DE CONVERSACION REAL DEL BOT
echo   Evaluacion de Coherencia y Calidad
echo ========================================
echo.
echo Este test simulara una conversacion completa
echo y evaluara la calidad de las respuestas.
echo.
echo Duracion aproximada: 20 segundos
echo.
pause
echo.
echo Ejecutando test...
echo.

node test-conversacion-real.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   TEST COMPLETADO EXITOSAMENTE
    echo ========================================
    echo.
    echo El bot esta listo para produccion
    echo.
) else (
    echo.
    echo ========================================
    echo   TEST REVELO PROBLEMAS
    echo ========================================
    echo.
    echo Revisa los resultados arriba
    echo.
)

pause

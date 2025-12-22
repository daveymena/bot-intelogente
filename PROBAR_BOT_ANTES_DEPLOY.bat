@echo off
echo.
echo ========================================
echo   PRUEBA COMPLETA DEL BOT
echo   Antes de subir a produccion
echo ========================================
echo.
echo Ejecutando tests...
echo.

node test-bot-completo-final.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   BOT LISTO PARA DEPLOY
    echo ========================================
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo   BOT NO ESTA LISTO
    echo   Revisa los errores arriba
    echo ========================================
    echo.
    pause
    exit /b 1
)

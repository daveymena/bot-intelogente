@echo off
color 0A
title Smart Sales Bot Pro - Test de Verificacion

cls
echo.
echo ========================================
echo   SMART SALES BOT PRO v2.0
echo   Test de Verificacion Rapido
echo ========================================
echo.
echo Este test verifica:
echo.
echo  - Saludos y conversacion
echo  - Busqueda de productos
echo  - Deteccion de fotos
echo  - Informacion de pago
echo  - Despedidas
echo  - Contexto basico
echo.
echo Tiempo: 1 segundo
echo.
echo ========================================
echo.
pause
echo.
echo Ejecutando test...
echo.

node test-bot-simulacion.js

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   BOT VERIFICADO
    echo ========================================
    echo.
    echo El bot funciona correctamente.
    echo.
    echo Siguiente paso:
    echo   .\PREPARAR_DEPLOY_COMPLETO.bat
    echo.
) else (
    echo ========================================
    echo   REVISAR ERRORES
    echo ========================================
    echo.
)
pause

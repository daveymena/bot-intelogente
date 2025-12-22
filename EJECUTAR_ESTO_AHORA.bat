@echo off
color 0A
title Smart Sales Bot Pro - Test Exhaustivo

cls
echo.
echo ========================================
echo   SMART SALES BOT PRO v2.0
echo   Test Exhaustivo - Verificacion Completa
echo ========================================
echo.
echo Este test verifica TODAS las capacidades:
echo.
echo  1. Contexto y Memoria (24h)
echo  2. Busqueda Inteligente
echo  3. Respuestas Coherentes
echo  4. Razonamiento
echo  5. Resolucion de Problemas
echo  6. Seguimiento Inteligente
echo  7. Cierre de Ventas
echo.
echo Total: 20 tests exhaustivos
echo Tiempo: 2-3 minutos
echo.
echo ========================================
echo.
pause
echo.
echo [1/2] Compilando TypeScript...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error compilando. Intentando continuar...
    echo.
)

echo.
echo [2/2] Ejecutando tests...
echo.

node test-bot-exhaustivo-completo.js

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   BOT LISTO PARA PRODUCCION
    echo ========================================
    echo.
    echo Siguiente paso:
    echo   .\PREPARAR_DEPLOY_COMPLETO.bat
    echo.
) else (
    echo ========================================
    echo   REVISAR ERRORES
    echo ========================================
    echo.
    echo Ver documentacion:
    echo   EXPLICACION_TEST_EXHAUSTIVO.md
    echo.
)
pause

@echo off
color 0A
title Smart Sales Bot Pro - Test Conversacion Real

cls
echo.
echo ========================================
echo   TEST DE CONVERSACION REAL COMPLETA
echo   Smart Sales Bot Pro v2.0
echo ========================================
echo.
echo Este test simula una conversacion REAL:
echo.
echo  - Productos reales de la base de datos
echo  - Contexto entre mensajes
echo  - Busqueda inteligente
echo  - Manejo de objeciones
echo  - Cierre de venta
echo.
echo IMPORTANTE:
echo  El servidor DEBE estar corriendo
echo.
echo ========================================
echo.
echo ¿El servidor esta corriendo? [S/N]
choice /C SN /M "Respuesta"

if errorlevel 2 (
    echo.
    echo Inicia el servidor primero:
    echo   npm run dev
    echo.
    echo Luego ejecuta este test de nuevo.
    pause
    exit /b 1
)

echo.
echo Ejecutando test de conversacion real...
echo.

node test-conversacion-real-completa.js

echo.
pause

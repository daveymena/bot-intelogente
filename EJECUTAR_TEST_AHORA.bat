@echo off
color 0B
title Smart Sales Bot Pro - Test Conversacion Real

cls
echo.
echo ========================================
echo   TEST DE CONVERSACION REAL
echo   Smart Sales Bot Pro v2.0
echo ========================================
echo.
echo Este test verifica:
echo.
echo  [1] Saludo inicial
echo  [2] Busqueda de productos
echo  [3] Contexto entre mensajes
echo  [4] Envio de fotos
echo  [5] Manejo de objeciones
echo  [6] Metodos de pago
echo  [7] Cierre de venta
echo  [8] Cambio de producto
echo  [9] Despedida profesional
echo.
echo ========================================
echo.

REM Verificar si el servidor está corriendo
echo Verificando servidor en puerto 4000...
curl -s http://localhost:4000/api/health >nul 2>&1

if %errorlevel% neq 0 (
    echo.
    echo [X] ERROR: El servidor NO esta corriendo
    echo.
    echo Inicia el servidor primero:
    echo   npm run dev
    echo.
    echo Luego ejecuta este test de nuevo.
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor corriendo correctamente
echo.
echo Ejecutando test de conversacion real...
echo.
echo ========================================
echo.

node test-conversacion-real-completa.js

echo.
echo ========================================
echo.
pause

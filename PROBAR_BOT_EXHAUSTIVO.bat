@echo off
echo.
echo ========================================
echo   TEST EXHAUSTIVO DEL BOT
echo   Verificacion Completa de Capacidades
echo ========================================
echo.
echo Este test verifica:
echo.
echo  1. Contexto y Memoria (24h)
echo  2. Busqueda Inteligente de Productos
echo  3. Respuestas Coherentes y Naturales
echo  4. Razonamiento y Comprension
echo  5. Capacidad de Resolver Problemas
echo  6. Seguimiento Inteligente
echo  7. Cierre de Ventas
echo.
echo Total: 20 tests exhaustivos
echo.
pause
echo.
echo [1/2] Compilando TypeScript...
call npm run build >nul 2>&1

echo.
echo [2/2] Ejecutando tests...
echo.

node test-bot-exhaustivo-completo.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   BOT VERIFICADO Y LISTO
    echo ========================================
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo   REVISAR ERRORES ARRIBA
    echo ========================================
    echo.
    pause
    exit /b 1
)

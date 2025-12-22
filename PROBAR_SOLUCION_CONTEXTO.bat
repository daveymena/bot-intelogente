@echo off
color 0A
title Verificar Solucion de Contexto

cls
echo.
echo ========================================
echo   VERIFICAR SOLUCION DE CONTEXTO
echo   Smart Sales Bot Pro v2.0
echo ========================================
echo.
echo Se arreglo la perdida de contexto.
echo.
echo Ahora el bot debe:
echo  [OK] Recordar el producto entre mensajes
echo  [OK] Responder "Que incluye?" correctamente
echo  [OK] Responder "Tienes fotos?" correctamente
echo  [OK] Mantener contexto en toda la conversacion
echo.
echo ========================================
echo.
echo Verificando servidor en puerto 4000...
curl -s http://localhost:4000/api/health >nul 2>&1

if %errorlevel% neq 0 (
    echo.
    echo [X] ERROR: El servidor NO esta corriendo
    echo.
    echo Inicia el servidor primero:
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor corriendo
echo.
echo Ejecutando test...
echo.
echo ========================================
echo.

node test-conversacion-real-completa.js

echo.
echo ========================================
echo.
echo Resultado esperado:
echo  - Escenario 3: "Que incluye?" = OK
echo  - Escenario 4: "Tienes fotos?" = OK
echo  - Escenario 5: "Me parece caro" = OK
echo.
echo Si todos pasan: SOLUCION EXITOSA!
echo Si fallan: Revisar logs del servidor
echo.
pause

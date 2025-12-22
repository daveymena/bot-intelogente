@echo off
echo ========================================
echo VERIFICACION OLLAMA EASYPANEL (GRATIS)
echo ========================================
echo.
echo Verificando que Ollama de Easypanel este funcionando...
echo.

REM Verificar que Ollama de Easypanel esta corriendo
echo [1/3] Verificando servicio Ollama en Easypanel...
curl -s https://ollama-ollama.ginee6.easypanel.host/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama de Easypanel NO responde
    echo.
    echo SOLUCION: Verifica en Easypanel que el servicio este activo
    echo URL: https://ollama-ollama.ginee6.easypanel.host
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Ollama de Easypanel esta corriendo
)

echo.
echo [2/3] Verificando configuracion .env...
findstr "USE_OLLAMA=true" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama NO esta activado en .env
    echo.
    echo SOLUCION: Edita .env y cambia:
    echo    USE_OLLAMA=true
    echo    OLLAMA_ENABLED=true
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Ollama activado en .env
)

echo.
echo [3/3] Probando respuesta de Ollama...
node test-ollama-completo.js

echo.
echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Sistema configurado para usar:
echo 1. OLLAMA en EASYPANEL (gratis) - Base principal
echo 2. GROQ (pago) - Solo respaldo
echo.
echo URL Ollama: https://ollama-ollama.ginee6.easypanel.host
echo Ahorro estimado: 80%% de costos
echo.
pause

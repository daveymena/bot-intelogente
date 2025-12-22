@echo off
cls
echo ========================================
echo   VERIFICACION COMPLETA - OLLAMA
echo ========================================
echo.

echo [1/5] Verificando .env...
findstr /C:"USE_OLLAMA=true" .env >nul
if %errorlevel%==0 (
    echo   [OK] USE_OLLAMA=true
) else (
    echo   [ERROR] USE_OLLAMA no esta en true
    goto :error
)

findstr /C:"OLLAMA_BASE_URL" .env >nul
if %errorlevel%==0 (
    echo   [OK] OLLAMA_BASE_URL configurado
) else (
    echo   [ERROR] OLLAMA_BASE_URL no configurado
    goto :error
)

findstr /C:"OLLAMA_MODEL" .env >nul
if %errorlevel%==0 (
    echo   [OK] OLLAMA_MODEL configurado
) else (
    echo   [ERROR] OLLAMA_MODEL no configurado
    goto :error
)

echo.
echo [2/5] Verificando archivos...
if exist "src\conversational-module\ai\ollamaClient.ts" (
    echo   [OK] ollamaClient.ts existe
) else (
    echo   [ERROR] ollamaClient.ts no existe
    goto :error
)

if exist "test-ollama-completo.js" (
    echo   [OK] test-ollama-completo.js existe
) else (
    echo   [ERROR] test-ollama-completo.js no existe
    goto :error
)

echo.
echo [3/5] Verificando documentacion...
if exist "OLLAMA_ACTIVADO_COMPLETO.md" (
    echo   [OK] OLLAMA_ACTIVADO_COMPLETO.md
) else (
    echo   [ADVERTENCIA] Documentacion faltante
)

if exist "COMO_USAR_OLLAMA_AHORA.md" (
    echo   [OK] COMO_USAR_OLLAMA_AHORA.md
) else (
    echo   [ADVERTENCIA] Guia de uso faltante
)

echo.
echo [4/5] Verificando conexion a Ollama...
curl -s https://ollama-ollama.ginee6.easypanel.host/api/tags >nul 2>&1
if %errorlevel%==0 (
    echo   [OK] Ollama responde
) else (
    echo   [ADVERTENCIA] No se pudo verificar Ollama
    echo   Puede estar temporalmente no disponible
)

echo.
echo [5/5] Verificando dependencias...
if exist "node_modules" (
    echo   [OK] node_modules existe
) else (
    echo   [ERROR] node_modules no existe
    echo   Ejecuta: npm install
    goto :error
)

echo.
echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
echo.
echo [OK] Todo esta listo para usar Ollama
echo.
echo Proximos pasos:
echo 1. Ejecutar: probar-ollama-completo.bat
echo 2. Ejecutar: INICIAR_OLLAMA_AHORA.bat
echo 3. Conectar WhatsApp
echo.
echo ========================================
pause
exit /b 0

:error
echo.
echo ========================================
echo   ERROR EN VERIFICACION
echo ========================================
echo.
echo Revisa los errores arriba y corrigelos
echo.
pause
exit /b 1

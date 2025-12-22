@echo off
echo.
echo ========================================
echo   CORRECCION IDIOMA INGLES - FORZAR ESPAÑOL
echo ========================================
echo.
echo Este script aplica la correccion para que el bot
echo SIEMPRE responda en ESPAÑOL (nunca en ingles)
echo.
echo Cambios aplicados:
echo - Prompt reforzado con idioma español obligatorio
echo - Validacion de respuestas en ingles
echo - Respuestas de emergencia en español
echo - Ollama configurado para español
echo.
echo ========================================
echo   PASO 1: Verificar configuracion
echo ========================================
echo.

REM Verificar que USE_OLLAMA=true
findstr /C:"USE_OLLAMA=true" .env >nul
if %errorlevel% equ 0 (
    echo [OK] USE_OLLAMA=true configurado
) else (
    echo [ADVERTENCIA] USE_OLLAMA no esta en true
    echo Configurando USE_OLLAMA=true...
    echo USE_OLLAMA=true >> .env
)

echo.
echo ========================================
echo   PASO 2: Reiniciar servidor
echo ========================================
echo.
echo Cerrando puertos...
call CERRAR_PUERTOS_AHORA.bat

echo.
echo Iniciando servidor con correcciones...
start cmd /k "npm run dev"

echo.
echo Esperando 10 segundos para que inicie...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   PASO 3: Probar bot en español
echo ========================================
echo.
echo Ejecutando test de idioma...
node test-idioma-espanol.js

echo.
echo ========================================
echo   CORRECCION COMPLETADA
echo ========================================
echo.
echo Si el test falla, verifica:
echo 1. Que el servidor este corriendo en puerto 3000
echo 2. Que WhatsApp este conectado
echo 3. Los logs del servidor para ver errores
echo.
echo Para probar manualmente:
echo - Envia: "tienes mega packs de idiomas?"
echo - El bot DEBE responder en ESPAÑOL
echo - Si responde en ingles, revisa los logs
echo.
pause

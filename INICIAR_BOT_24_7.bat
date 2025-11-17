@echo off
echo ========================================
echo   BOT 24/7 - INICIO RAPIDO
echo ========================================
echo.

echo [1/4] Entrenando el bot...
call npx tsx scripts/entrenar-bot-24-7-completo.ts
if errorlevel 1 (
    echo ERROR: Fallo el entrenamiento
    pause
    exit /b 1
)
echo.

echo [2/4] Probando respuestas humanizadas...
call npx tsx scripts/test-humanized-responses.ts
if errorlevel 1 (
    echo ADVERTENCIA: Algunos tests fallaron
)
echo.

echo [3/4] Probando sistema completo...
call npx tsx scripts/test-bot-24-7-complete.ts
if errorlevel 1 (
    echo ADVERTENCIA: Algunos tests fallaron
)
echo.

echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo   BOT LISTO - Conecta WhatsApp en:
echo   http://localhost:3000
echo ========================================
echo.

call npm run dev

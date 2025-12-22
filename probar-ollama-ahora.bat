@echo off
cls
echo ========================================
echo   PROBAR OLLAMA gemma3:4b (SOLO)
echo   Groq DESACTIVADO - Timeout: 5 minutos
echo ========================================
echo.

echo 1. Verificando que Ollama este corriendo...
ollama list
if errorlevel 1 (
    echo.
    echo ❌ Ollama no esta corriendo
    echo 💡 Inicialo con: ollama serve
    pause
    exit /b 1
)

echo.
echo 2. Probando conexion y respuesta...
echo ⏳ NOTA: Puede tomar hasta 5 minutos en la primera respuesta
echo.
node test-ollama-gemma2.js

echo.
echo ========================================
echo   PRUEBA COMPLETADA
echo ========================================
echo.
echo Configuracion actual:
echo   - Groq: DESACTIVADO (sin tokens)
echo   - Ollama: ACTIVADO (unico proveedor)
echo   - Timeout: 5 minutos
echo.
echo Ahora puedes entrenar el bot con:
echo   npx tsx scripts/entrenar-bot.ts
echo.
pause

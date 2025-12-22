@echo off
echo ========================================
echo   VERIFICACION SISTEMA IA COMPLETO
echo ========================================
echo.

echo 1. Verificando Ollama...
ollama list
echo.

echo 2. Probando Ollama con gemma2:4b...
node test-ollama-gemma2.js
echo.

echo 3. Estado de las APIs...
echo GROQ_API_KEY: %GROQ_API_KEY:~0,20%...
echo OLLAMA_ENABLED: %OLLAMA_ENABLED%
echo OLLAMA_MODEL: %OLLAMA_MODEL%
echo.

echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
pause

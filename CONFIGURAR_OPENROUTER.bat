@echo off
echo ========================================
echo   CONFIGURAR OPENROUTER
echo ========================================
echo.
echo OpenRouter te da 50 mensajes/dia GRATIS
echo Perfecto como respaldo de Groq!
echo.
echo Este script va a:
echo - Agregar tu API Key de OpenRouter
echo - Configurar el orden de fallback
echo - Habilitar cambio automatico
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

node configurar-openrouter.js

echo.
echo ========================================
echo   PROBAR SISTEMA DE TRIPLE RESPALDO
echo ========================================
echo.
echo Ahora vamos a probar que todo funcione:
echo - Groq (principal)
echo - OpenRouter (respaldo 50 msg/dia)
echo - Ollama (local sin limites)
echo.
pause

node test-triple-respaldo.js

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Tu bot ahora tiene:
echo - Triple respaldo automatico
echo - 50 mensajes extra/dia con OpenRouter
echo - Ollama local como ultima opcion
echo - Cambio automatico sin intervencion
echo.
echo Listo para funcionar 24/7!
echo.
pause

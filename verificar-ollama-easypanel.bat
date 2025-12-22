@echo off
echo ========================================
echo  VERIFICAR OLLAMA EN EASYPANEL
echo ========================================
echo.
echo URL: https://ollama-ollama.sqaoeo.easypanel.host
echo.
echo Verificando modelos disponibles...
echo.

curl -s https://ollama-ollama.sqaoeo.easypanel.host/api/tags

echo.
echo.
echo ========================================
echo  PROBAR MODELO
echo ========================================
echo.

curl -X POST https://ollama-ollama.sqaoeo.easypanel.host/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"gemma3:4b-it-qat\",\"prompt\":\"Hola, responde en una palabra en español\",\"stream\":false}"

echo.
echo.
echo ========================================
pause

@echo off
echo ========================================
echo  VERIFICAR MODELOS OLLAMA
echo ========================================
echo.
echo Modelos instalados:
echo.

ollama list

echo.
echo ========================================
echo  PROBAR QWEN2.5
echo ========================================
echo.
echo Probando modelo...
echo.

ollama run qwen2.5:3b-instruct "Hola, responde en una palabra"

echo.
echo ========================================
pause

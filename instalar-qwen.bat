@echo off
echo ========================================
echo  INSTALAR QWEN2.5:3B EN OLLAMA
echo ========================================
echo.
echo Descargando modelo Qwen2.5:3b-instruct...
echo Esto puede tardar unos minutos...
echo.

ollama pull qwen2.5:3b-instruct

echo.
echo ========================================
echo  VERIFICANDO INSTALACION
echo ========================================
echo.

ollama list

echo.
echo ========================================
echo  LISTO - Ahora puedes probar:
echo  probar-ollama-simple.bat
echo ========================================
pause

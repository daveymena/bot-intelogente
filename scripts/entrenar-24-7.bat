@echo off
echo ========================================
echo ENTRENAMIENTO CONTINUO 24/7
echo ========================================
echo.
echo Verificando Ollama...

curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Ollama no esta corriendo
    echo.
    echo Ejecuta en otra terminal:
    echo   ollama serve
    echo.
    pause
    exit /b 1
)

echo [OK] Ollama conectado
echo.
echo Iniciando entrenamiento continuo...
echo Presiona Ctrl+C para detener
echo.

npx tsx scripts/entrenar-24-7.ts

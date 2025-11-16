@echo off
echo ========================================
echo GENERADOR DE DATASET - RAPIDO
echo Solo Ollama (sin Groq)
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
echo Generando conversaciones...
echo Esto tomara 2-3 minutos
echo.

npx tsx scripts/generar-dataset-ollama-solo.ts

echo.
echo ========================================
echo COMPLETADO
echo ========================================
pause

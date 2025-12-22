@echo off
echo ========================================
echo 🦙 PROBANDO OLLAMA FORZADO
echo ========================================
echo.

echo 1. Verificando Ollama...
curl -s http://localhost:11434/api/tags
if %errorlevel% neq 0 (
    echo ❌ Ollama NO está corriendo
    echo.
    echo Inicia Ollama con: ollama serve
    pause
    exit /b 1
)

echo.
echo ✅ Ollama está corriendo
echo.

echo 2. Probando búsqueda con Ollama...
npx tsx scripts/test-ollama-search.ts

echo.
echo ========================================
echo ✅ Prueba completada
echo ========================================
pause

@echo off
echo ========================================
echo SMART SALES BOT PRO
echo Iniciando con Ollama llama3.1:8b
echo ========================================
echo.

echo [1/3] Verificando Ollama...
curl -s https://davey-ollama2.mapf5v.easypanel.host/api/tags > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Ollama no esta disponible
    echo Verifica que el contenedor este corriendo en Easypanel
    pause
    exit /b 1
)
echo ✅ Ollama disponible

echo.
echo [2/3] Verificando modelo llama3.1:8b...
curl -s https://davey-ollama2.mapf5v.easypanel.host/api/tags | findstr "llama3.1:8b" > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Modelo llama3.1:8b no encontrado
    echo Ejecuta en Easypanel: ollama pull llama3.1:8b
    pause
    exit /b 1
)
echo ✅ Modelo llama3.1:8b disponible

echo.
echo [3/3] Iniciando servidor...
echo.
echo 🚀 Configuracion:
echo    - IA Principal: Ollama llama3.1:8b
echo    - Fallback: Bot Local (sin IA)
echo    - Groq: Desactivado (ahorro de costos)
echo    - Puerto: 3000
echo.
echo 📊 Dashboard: http://localhost:3000
echo 📱 WhatsApp: Conectar desde el dashboard
echo.

npm run dev

pause

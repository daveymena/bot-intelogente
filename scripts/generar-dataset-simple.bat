@echo off
echo ========================================
echo GENERADOR DE DATASET SIMPLIFICADO
echo (Sin Docker - Solo Node.js)
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo Descargalo de: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js instalado
echo.

REM Verificar Groq API Key
if "%GROQ_API_KEY%"=="" (
    echo [ADVERTENCIA] GROQ_API_KEY no configurada
    echo El sistema usara solo Ollama si esta disponible
    echo.
    echo Para usar Groq:
    echo 1. Obtener API key de: https://console.groq.com/
    echo 2. Agregar a .env: GROQ_API_KEY=tu_key_aqui
    echo.
    pause
)

REM Verificar Ollama (opcional)
where ollama >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama instalado
    ollama list
) else (
    echo [INFO] Ollama no instalado (opcional)
    echo Si quieres usarlo: https://ollama.ai/download
)

echo.
echo ========================================
echo Iniciando generacion de dataset...
echo Esto puede tomar 30-60 minutos
echo ========================================
echo.

REM Crear directorio de training
if not exist "data\training" mkdir "data\training"

echo ========================================
echo Quieres hacer un test rapido primero?
echo (Genera solo 1 conversacion para probar)
echo ========================================
echo.
set /p test="Test rapido? (S/N): "

if /i "%test%"=="S" (
    echo.
    echo Ejecutando test rapido...
    npx tsx scripts/test-generacion-rapida.ts
    echo.
    echo ========================================
    echo Quieres continuar con la generacion completa?
    echo ========================================
    set /p continuar="Continuar? (S/N): "
    if /i not "%continuar%"=="S" (
        echo.
        echo Cancelado por el usuario
        pause
        exit /b 0
    )
)

echo.
echo Ejecutando generacion completa...
echo.

REM Ejecutar generador
npx tsx scripts/generar-dataset-completo.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [EXITO] Dataset generado!
    echo ========================================
    echo.
    echo Archivos creados en data/training/:
    dir /b data\training\
    echo.
    echo Proximos pasos:
    echo 1. Revisar dataset en data/training/
    echo 2. Usar conversaciones para entrenar tu sistema
    echo 3. Integrar con tu bot actual
    echo.
) else (
    echo.
    echo [ERROR] Fallo la generacion
    echo Revisa los logs arriba
    echo.
)

pause

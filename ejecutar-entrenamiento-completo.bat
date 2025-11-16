@echo off
REM Ejecutar entrenamiento completo: Groq + Preparación para Ollama

setlocal enabledelayedexpansion

echo.
echo ========================================================================
echo ENTRENAMIENTO COMPLETO - GROQ + OLLAMA
echo ========================================================================
echo.
echo Este script ejecutará:
echo   1. Entrenamiento rápido con Groq
echo   2. Preparación de datos para Ollama
echo   3. Generación de ejemplos de entrenamiento
echo   4. Creación de contexto de búsqueda
echo.
echo Tiempo estimado: 10-15 minutos
echo.

REM Verificar que GROQ_API_KEY esté configurada
if "%GROQ_API_KEY%"=="" (
    echo Error: GROQ_API_KEY no está configurada
    echo.
    echo Por favor, configura la variable de entorno:
    echo   set GROQ_API_KEY=tu_clave_aqui
    echo.
    pause
    exit /b 1
)

echo ✓ GROQ_API_KEY detectada
echo.

REM Paso 1: Entrenamiento con Groq
echo ========================================================================
echo PASO 1: ENTRENAMIENTO CON GROQ
echo ========================================================================
echo.

node entrenamiento-rapido-groq.js

if %errorlevel% neq 0 (
    echo.
    echo Error durante el entrenamiento con Groq
    pause
    exit /b 1
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul

REM Paso 2: Preparar datos para Ollama
echo.
echo ========================================================================
echo PASO 2: PREPARAR DATOS PARA OLLAMA
echo ========================================================================
echo.

node preparar-datos-ollama.js

if %errorlevel% neq 0 (
    echo.
    echo Error durante la preparación de datos
    pause
    exit /b 1
)

echo.
echo ========================================================================
echo ENTRENAMIENTO COMPLETADO
echo ========================================================================
echo.
echo Archivos generados:
echo   • training-data-groq.json
echo   • training-report-groq.json
echo   • ollama-training-data.json
echo   • search-context.json
echo   • training-examples.json
echo   • ollama-training-report.json
echo.
echo Próximos pasos:
echo   1. Revisar los archivos generados
echo   2. Usar con Ollama para mejorar embeddings
echo   3. Integrar en el bot
echo.

pause

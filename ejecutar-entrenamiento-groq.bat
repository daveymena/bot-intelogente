@echo off
REM Ejecutar entrenamiento rápido con Groq

setlocal enabledelayedexpansion

echo.
echo ========================================================================
echo ENTRENAMIENTO RAPIDO CON GROQ
echo ========================================================================
echo.
echo Este script ejecutará:
echo   1. Análisis de cada producto
echo   2. Generación de descripciones mejoradas
echo   3. Clasificación automática de categorías
echo   4. Extracción de palabras clave
echo   5. Detección de intenciones
echo.
echo Tiempo estimado: 5-10 minutos
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

REM Ejecutar entrenamiento
echo Iniciando entrenamiento...
echo.

node entrenamiento-rapido-groq.js

if %errorlevel% neq 0 (
    echo.
    echo Error durante el entrenamiento
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
echo.
echo Próximos pasos:
echo   1. Revisar los archivos generados
echo   2. Usar para entrenamiento con Ollama
echo   3. Integrar en el bot
echo.

pause

@echo off
cls
echo.
echo ========================================
echo   SISTEMA DE ENTRENAMIENTO 24/7
echo ========================================
echo.
echo Este sistema entrena tu bot automaticamente
echo usando Ollama (IA local gratuita)
echo.
echo ========================================
echo.

:menu
echo Selecciona una opcion:
echo.
echo 1. Verificar Ollama
echo 2. Descargar modelos de IA
echo 3. Iniciar entrenamiento
echo 4. Ver estadisticas
echo 5. Salir
echo.
set /p opcion="Opcion: "

if "%opcion%"=="1" goto verificar
if "%opcion%"=="2" goto descargar
if "%opcion%"=="3" goto entrenar
if "%opcion%"=="4" goto stats
if "%opcion%"=="5" goto salir

echo Opcion invalida
pause
goto menu

:verificar
echo.
echo Verificando Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Ollama no esta corriendo
    echo.
    echo Descarga Ollama desde: https://ollama.com/download
    echo O ejecuta: ollama serve
) else (
    echo [OK] Ollama esta corriendo
    echo.
    echo Modelos instalados:
    ollama list
)
echo.
pause
goto menu

:descargar
echo.
echo Descargando modelos de IA...
echo Esto puede tomar varios minutos
echo.
ollama pull gemma2:2b
echo.
echo [OK] Modelo descargado
pause
goto menu

:entrenar
echo.
echo Iniciando entrenamiento continuo...
echo Presiona Ctrl+C para detener
echo.
pause
npx tsx scripts/entrenar-24-7.ts
goto menu

:stats
echo.
echo Cargando estadisticas...
echo.
npx tsx scripts/ver-stats-entrenamiento.ts
pause
goto menu

:salir
echo.
echo Hasta luego!
exit

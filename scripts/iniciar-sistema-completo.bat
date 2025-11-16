@echo off
echo ========================================
echo SISTEMA COMPLETO DE IA NEURONAL
echo ========================================
echo.

echo Que deseas hacer?
echo.
echo 1. Instalar todo (primera vez)
echo 2. Iniciar Core AI Server
echo 3. Generar dataset (1000+ conversaciones)
echo 4. Entrenar red neuronal
echo 5. Probar sistema
echo 6. Ver documentacion
echo 7. Salir
echo.

set /p opcion="Selecciona una opcion (1-7): "

if "%opcion%"=="1" goto instalar
if "%opcion%"=="2" goto iniciar_core
if "%opcion%"=="3" goto generar_dataset
if "%opcion%"=="4" goto entrenar
if "%opcion%"=="5" goto probar
if "%opcion%"=="6" goto docs
if "%opcion%"=="7" goto salir

echo Opcion invalida
pause
exit /b 1

:instalar
echo.
echo ========================================
echo INSTALANDO TODO...
echo ========================================
echo.
call scripts\instalar-todo-windows.bat
goto menu

:iniciar_core
echo.
echo ========================================
echo INICIANDO CORE AI...
echo ========================================
echo.
start "Core AI Server" cmd /k "cd ai-local-system\core-ai && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo.
echo [OK] Core AI iniciado en nueva ventana
echo Servidor: http://localhost:8000
echo.
timeout /t 5
goto menu

:generar_dataset
echo.
echo ========================================
echo GENERANDO DATASET...
echo ========================================
echo.
echo Esto puede tomar 30-60 minutos
echo.
pause
npx tsx scripts/generar-dataset-completo.ts
echo.
echo [OK] Dataset generado en data/training/
echo.
pause
goto menu

:entrenar
echo.
echo ========================================
echo ENTRENANDO RED NEURONAL...
echo ========================================
echo.
echo Asegurate de que Core AI este corriendo
echo.
pause
npx tsx scripts/entrenar-red-neuronal-completa.ts
echo.
echo [OK] Entrenamiento completado
echo.
pause
goto menu

:probar
echo.
echo ========================================
echo PROBANDO SISTEMA...
echo ========================================
echo.

REM Health check
echo 1. Health Check:
curl -s http://localhost:8000/health
echo.
echo.

REM Test query
echo 2. Test Query:
curl -s -X POST http://localhost:8000/query ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\":\"test\",\"text\":\"Hola\"}"
echo.
echo.

REM Stats
echo 3. Estadisticas:
curl -s http://localhost:8000/stats
echo.
echo.

pause
goto menu

:docs
echo.
echo ========================================
echo DOCUMENTACION DISPONIBLE
echo ========================================
echo.
echo Guias principales:
echo.
echo 1. INSTALACION_COMPLETA_WINDOWS.md
echo    - Instalacion paso a paso
echo.
echo 2. GUIA_RAPIDA_SIN_DOCKER.md
echo    - Uso sin Docker
echo.
echo 3. ENTRENAMIENTO_COMPLETO_README.md
echo    - Entrenamiento detallado
echo.
echo 4. INTEGRACION_CORE_AI.md
echo    - Integracion con tu bot
echo.
echo 5. RESUMEN_FINAL_SISTEMA_NEURONAL.md
echo    - Resumen completo
echo.
pause
goto menu

:menu
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para volver al menu...
pause >nul
cls
goto :eof

:salir
echo.
echo Saliendo...
exit /b 0

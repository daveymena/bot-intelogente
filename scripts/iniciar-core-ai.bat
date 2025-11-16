@echo off
echo ========================================
echo INICIANDO CORE AI SERVICE
echo ========================================
echo.

REM Verificar que existe el entorno virtual
if not exist "ai-local-system\core-ai\venv" (
    echo [ERROR] Entorno virtual no encontrado
    echo.
    echo Primero ejecuta: scripts\instalar-todo-windows.bat
    echo.
    pause
    exit /b 1
)

echo [INFO] Activando entorno virtual...
cd ai-local-system\core-ai
call venv\Scripts\activate

echo.
echo [INFO] Verificando instalacion...
python -c "import fastapi; import uvicorn; print('OK')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Dependencias no instaladas correctamente
    echo.
    echo Ejecuta: pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo [OK] Dependencias verificadas
echo.

echo ========================================
echo INICIANDO SERVIDOR EN PUERTO 8000
echo ========================================
echo.
echo Servidor: http://localhost:8000
echo Health: http://localhost:8000/health
echo Docs: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener
echo.

REM Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause

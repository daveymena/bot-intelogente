@echo off
echo ========================================
echo INSTALACION COMPLETA - WINDOWS
echo Sistema de IA Neuronal
echo ========================================
echo.

REM Verificar si se ejecuta como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Ejecutando como administrador
) else (
    echo [ADVERTENCIA] No se esta ejecutando como administrador
    echo Algunas instalaciones pueden fallar
    echo.
    pause
)

echo ========================================
echo Paso 1: Verificando Node.js
echo ========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo.
    echo Descargalo de: https://nodejs.org/
    echo Instala la version LTS
    echo.
    pause
    exit /b 1
)

node --version
echo [OK] Node.js instalado
echo.

echo ========================================
echo Paso 2: Verificando Python 3.11
echo ========================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python no esta instalado
    echo.
    echo Descargalo de: https://www.python.org/downloads/
    echo IMPORTANTE: Marca "Add Python to PATH"
    echo Usa Python 3.11.x (no 3.12)
    echo.
    pause
    exit /b 1
)

python --version
echo [OK] Python instalado
echo.

REM Verificar version de Python
python -c "import sys; exit(0 if sys.version_info >= (3, 11) and sys.version_info < (3, 12) else 1)"
if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] Se recomienda Python 3.11.x
    echo Tu version puede causar problemas
    echo.
    pause
)

echo ========================================
echo Paso 3: Creando entorno virtual Python
echo ========================================
echo.

cd ai-local-system\core-ai

if exist venv (
    echo [INFO] Entorno virtual ya existe
) else (
    echo Creando entorno virtual...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] No se pudo crear entorno virtual
        pause
        exit /b 1
    )
    echo [OK] Entorno virtual creado
)

echo.

echo ========================================
echo Paso 4: Instalando dependencias Python
echo ========================================
echo.
echo Esto puede tomar 5-10 minutos...
echo.

call venv\Scripts\activate

REM Actualizar pip
python -m pip install --upgrade pip

REM Instalar dependencias
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Algunas dependencias fallaron
    echo.
    echo Soluciones comunes:
    echo 1. Instalar Visual C++ Build Tools
    echo    https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo.
    echo 2. Instalar PyTorch manualmente:
    echo    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencias instaladas
echo.

echo ========================================
echo Paso 5: Entrenando modelo inicial
echo ========================================
echo.

python scripts/train_intent.py

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo el entrenamiento inicial
    pause
    exit /b 1
)

echo [OK] Modelo entrenado
echo.

echo ========================================
echo Paso 6: Cargando base de conocimiento
echo ========================================
echo.

python scripts/load_kb.py

if %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] Fallo la carga de KB
    echo El sistema puede funcionar sin esto
    echo.
)

echo.

echo ========================================
echo Paso 7: Verificando Groq API
echo ========================================
echo.

cd ..\..

if "%GROQ_API_KEY%"=="" (
    echo [ADVERTENCIA] GROQ_API_KEY no configurada
    echo.
    echo Para configurarla:
    echo 1. Ir a: https://console.groq.com/
    echo 2. Crear cuenta gratis
    echo 3. Obtener API key
    echo 4. Agregar a .env: GROQ_API_KEY=gsk_tu_key_aqui
    echo.
    pause
) else (
    echo [OK] GROQ_API_KEY configurada
)

echo.

echo ========================================
echo Paso 8: Verificando Ollama (opcional)
echo ========================================
echo.

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
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo [OK] Node.js: Instalado
echo [OK] Python 3.11: Instalado
echo [OK] Dependencias Python: Instaladas
echo [OK] Modelo inicial: Entrenado
echo [OK] Base de conocimiento: Cargada
echo.
echo Proximos pasos:
echo.
echo 1. Iniciar Core AI:
echo    cd ai-local-system\core-ai
echo    venv\Scripts\activate
echo    uvicorn app.main:app --host 0.0.0.0 --port 8000
echo.
echo 2. Generar dataset (en otra ventana):
echo    npx tsx scripts/generar-dataset-completo.ts
echo.
echo 3. Entrenar red neuronal:
echo    npx tsx scripts/entrenar-red-neuronal-completa.ts
echo.
echo 4. Integrar con tu bot:
echo    Ver: INTEGRACION_CORE_AI.md
echo.
echo ========================================
echo.

pause

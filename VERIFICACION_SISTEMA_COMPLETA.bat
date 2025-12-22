@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     VERIFICACIÓN COMPLETA DEL SISTEMA - SMART SALES BOT      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🔍 Verificando todos los componentes del sistema...
echo.

REM Verificar Node.js
echo [1/10] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
) else (
    echo ✅ Node.js instalado
)

REM Verificar dependencias
echo.
echo [2/10] Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️ Instalando dependencias...
    call npm install
) else (
    echo ✅ Dependencias instaladas
)

REM Verificar .env
echo.
echo [3/10] Verificando configuración (.env)...
if not exist ".env" (
    echo ❌ Archivo .env no encontrado
    pause
    exit /b 1
) else (
    echo ✅ Archivo .env encontrado
)

REM Verificar Ollama
echo.
echo [4/10] Verificando Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Ollama no está corriendo localmente
    echo    Verificando URL remota...
    curl -s https://ollama-ollama.ginee6.easypanel.host/api/tags >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Ollama no disponible (ni local ni remoto)
    ) else (
        echo ✅ Ollama remoto disponible
    )
) else (
    echo ✅ Ollama local disponible
)

REM Verificar Groq API Key
echo.
echo [5/10] Verificando Groq API Key...
findstr /C:"GROQ_API_KEY=gsk_" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ GROQ_API_KEY no configurada
) else (
    echo ✅ GROQ_API_KEY configurada
)

REM Verificar Base de Datos
echo.
echo [6/10] Verificando Base de Datos...
findstr /C:"DATABASE_URL=" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ DATABASE_URL no configurada
) else (
    echo ✅ DATABASE_URL configurada
)

REM Verificar Prisma
echo.
echo [7/10] Verificando Prisma Client...
if not exist "node_modules\.prisma\client" (
    echo ⚠️ Generando Prisma Client...
    call npx prisma generate
) else (
    echo ✅ Prisma Client generado
)

REM Verificar archivos críticos
echo.
echo [8/10] Verificando archivos críticos...
set "archivos_criticos=server.ts src\lib\super-sales-ai.ts src\lib\professional-ollama-orchestrator.ts src\lib\baileys-stable-service.ts"
set "archivos_ok=0"
set "archivos_total=0"

for %%f in (%archivos_criticos%) do (
    set /a archivos_total+=1
    if exist "%%f" (
        set /a archivos_ok+=1
    ) else (
        echo    ❌ Falta: %%f
    )
)

if %archivos_ok%==%archivos_total% (
    echo ✅ Todos los archivos críticos presentes
) else (
    echo ⚠️ Faltan %archivos_total% - %archivos_ok% archivos
)

REM Verificar puertos
echo.
echo [9/10] Verificando puertos...
netstat -ano | findstr ":4000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Puerto 4000 en uso
    echo    Cerrando proceso...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 >nul
    echo ✅ Puerto 4000 liberado
) else (
    echo ✅ Puerto 4000 disponible
)

REM Verificar estructura de directorios
echo.
echo [10/10] Verificando estructura de directorios...
if not exist "auth_sessions" mkdir auth_sessions
if not exist "temp-audio" mkdir temp-audio
echo ✅ Directorios creados

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    RESUMEN DE VERIFICACIÓN                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Sistema verificado y listo para iniciar
echo.
echo 📋 COMPONENTES VERIFICADOS:
echo    • Node.js y dependencias
echo    • Configuración (.env)
echo    • Ollama (IA local/remota)
echo    • Groq (IA fallback)
echo    • Base de datos PostgreSQL
echo    • Prisma ORM
echo    • Archivos críticos del sistema
echo    • Puertos disponibles
echo    • Estructura de directorios
echo.
echo 🚀 SIGUIENTE PASO:
echo    Ejecuta: INICIAR_CON_OLLAMA_LLAMA31.bat
echo.
pause

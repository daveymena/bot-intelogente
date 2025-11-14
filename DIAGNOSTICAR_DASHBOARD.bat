@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🔍 DIAGNÓSTICO DASHBOARD - BAILEYS                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/5] 📦 Verificando dependencias...
call npm list @whiskeysockets/baileys 2>nul | findstr "baileys"
if errorlevel 1 (
    echo ❌ Baileys no instalado
    echo.
    echo 📥 Instalando dependencias...
    call npm install
) else (
    echo ✅ Baileys instalado
)

echo.
echo [2/5] 🗄️ Verificando base de datos...
if exist "prisma\dev.db" (
    echo ✅ Base de datos existe
) else (
    echo ⚠️ Base de datos no existe, creando...
    call npx prisma generate
    call npx prisma db push
)

echo.
echo [3/5] 🔧 Verificando archivos críticos...
if exist "src\lib\baileys-stable-service.ts" (
    echo ✅ baileys-stable-service.ts existe
) else (
    echo ❌ baileys-stable-service.ts NO EXISTE
    echo    Este archivo es crítico para el funcionamiento
)

if exist "src\app\api\whatsapp\status\route.ts" (
    echo ✅ API status route existe
) else (
    echo ❌ API status route NO EXISTE
)

if exist "src\app\api\whatsapp\connect\route.ts" (
    echo ✅ API connect route existe
) else (
    echo ❌ API connect route NO EXISTE
)

echo.
echo [4/5] 🌐 Verificando servidor Next.js...
echo    Intentando conectar a http://localhost:3000...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Servidor NO está corriendo
    echo.
    echo 💡 SOLUCIÓN: Necesitas iniciar el servidor primero
    echo    Ejecuta: npm run dev
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Servidor está corriendo
)

echo.
echo [5/5] 🧪 Probando API de WhatsApp...
curl -s http://localhost:3000/api/whatsapp/status >nul 2>&1
if errorlevel 1 (
    echo ⚠️ API no responde (puede ser normal si no estás autenticado)
) else (
    echo ✅ API responde
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    📋 DIAGNÓSTICO COMPLETO                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 💡 PRÓXIMOS PASOS:
echo.
echo 1. Si el servidor NO está corriendo:
echo    → Ejecuta: npm run dev
echo.
echo 2. Si hay errores de compilación:
echo    → Ejecuta: ARREGLAR_ERRORES_TYPESCRIPT.bat
echo.
echo 3. Si todo está OK pero el dashboard no funciona:
echo    → Abre: http://localhost:3000
echo    → Revisa la consola del navegador (F12)
echo.
echo 4. Para iniciar todo desde cero:
echo    → Ejecuta: INICIAR_TODO_LIMPIO.bat
echo.
pause

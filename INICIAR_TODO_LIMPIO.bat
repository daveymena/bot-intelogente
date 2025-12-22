@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 INICIAR TODO LIMPIO - BAILEYS + DASHBOARD          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/6] 🧹 Limpiando sesiones anteriores...
if exist "auth_sessions" (
    rmdir /s /q "auth_sessions" 2>nul
    echo    ✅ Sesiones eliminadas
)

if exist ".wwebjs_auth" (
    rmdir /s /q ".wwebjs_auth" 2>nul
    echo    ✅ Cache WhatsApp eliminado
)

echo.
echo [2/6] 🧹 Limpiando compilación...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo    ✅ .next eliminado
)

echo.
echo [3/6] 📦 Verificando dependencias...
call npm install

echo.
echo [4/6] 🗄️ Configurando base de datos...
call npx prisma generate
call npx prisma db push

echo.
echo [5/6] 🔧 Verificando archivos críticos...
node -e "const fs = require('fs'); const files = ['src/lib/baileys-stable-service.ts', 'src/app/api/whatsapp/status/route.ts', 'src/app/api/whatsapp/connect/route.ts']; files.forEach(f => console.log(fs.existsSync(f) ? '✅ ' + f : '❌ ' + f + ' FALTA'));"

echo.
echo [6/6] 🚀 Iniciando servidor...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              🌐 ABRIENDO DASHBOARD EN NAVEGADOR           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo    URL: http://localhost:3000
echo.
echo    💡 El navegador se abrirá automáticamente en 5 segundos...
echo    💡 Si no se abre, copia y pega la URL en tu navegador
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo    🚀 Iniciando servidor Next.js...
echo.
call npm run dev

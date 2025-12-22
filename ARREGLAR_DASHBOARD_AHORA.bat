@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🔧 ARREGLAR DASHBOARD - SOLUCIÓN AUTOMÁTICA               ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/5] 🛑 Cerrando procesos de Node.js anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo    ✅ Procesos cerrados

echo.
echo [2/5] 🧹 Limpiando archivos de compilación...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo    ✅ .next eliminado
)

if exist "tsconfig.tsbuildinfo" (
    del /f /q "tsconfig.tsbuildinfo" 2>nul
    echo    ✅ tsconfig.tsbuildinfo eliminado
)

echo.
echo [3/5] 📦 Verificando dependencias...
call npm install --silent

echo.
echo [4/5] 🗄️ Configurando base de datos...
call npx prisma generate --silent
call npx prisma db push --accept-data-loss --skip-generate --force-reset 2>nul

echo.
echo [5/5] 🚀 Iniciando servidor...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              🌐 ABRIENDO DASHBOARD EN NAVEGADOR               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo    URL: http://localhost:3000
echo.
echo    💡 El navegador se abrirá en 3 segundos...
echo.

timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo    🚀 Iniciando servidor Next.js...
echo    ⏳ Espera a ver "Ready in X.Xs"
echo.
echo    ⚠️ NO CIERRES ESTA VENTANA
echo.

call npm run dev

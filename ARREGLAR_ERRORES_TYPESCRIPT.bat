@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🔧 ARREGLAR ERRORES TYPESCRIPT                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/3] 🧹 Limpiando archivos de compilación...
if exist ".next" (
    echo    Eliminando carpeta .next...
    rmdir /s /q ".next" 2>nul
    echo    ✅ .next eliminado
)

if exist "tsconfig.tsbuildinfo" (
    del /f /q "tsconfig.tsbuildinfo" 2>nul
    echo    ✅ tsconfig.tsbuildinfo eliminado
)

echo.
echo [2/3] 📦 Reinstalando dependencias TypeScript...
call npm install --save-dev typescript @types/node @types/react @types/react-dom

echo.
echo [3/3] 🔄 Regenerando Prisma Client...
call npx prisma generate

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✅ LIMPIEZA COMPLETA                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 💡 Ahora ejecuta: npm run dev
echo.
pause

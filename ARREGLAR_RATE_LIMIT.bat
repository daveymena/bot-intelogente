@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🔧 ARREGLAR RATE LIMIT - CAMBIAR A MODELO LIGERO          ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/3] 📝 Cambiando modelo de Groq...
echo.

node cambiar-modelo-groq.js

if errorlevel 1 (
    echo.
    echo ❌ Error al cambiar modelo
    pause
    exit /b 1
)

echo.
echo [2/3] 🧹 Limpiando caché de Next.js...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo    ✅ Caché eliminado
)

echo.
echo [3/3] ✅ Cambios completados
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ MODELO CAMBIADO EXITOSAMENTE                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📊 CAMBIOS REALIZADOS:
echo.
echo    ANTES: llama-3.3-70b-versatile (consume 22,901 tokens/consulta)
echo    AHORA: llama-3.1-8b-instant (consume ~2,000 tokens/consulta)
echo.
echo 💡 BENEFICIOS:
echo    ✅ 10x menos consumo de tokens
echo    ✅ Respuestas más rápidas
echo    ✅ No más rate limits
echo.
echo 🚀 PRÓXIMO PASO:
echo    Reinicia el bot: npm run dev
echo.
pause

@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🔍 DETECTAR MODELOS DISPONIBLES - AUTOMÁTICO              ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

node detectar-modelos-disponibles.js --auto

if errorlevel 1 (
    echo.
    echo ❌ Error en la detección
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              ✅ DETECCIÓN COMPLETADA                           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 ¿Deseas reiniciar el bot ahora? (S/N)
set /p REINICIAR=

if /i "%REINICIAR%"=="S" (
    echo.
    echo 🚀 Reiniciando bot...
    echo.
    call npm run dev
) else (
    echo.
    echo ℹ️ Para reiniciar el bot manualmente:
    echo    npm run dev
    echo.
    pause
)

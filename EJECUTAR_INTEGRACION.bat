@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🤖 INTEGRACIÓN AUTOMÁTICA - RAZONAMIENTO PROFUNDO         ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/2] 🔧 Ejecutando script de integración...
echo.

node aplicar-razonamiento-automatico.js

if errorlevel 1 (
    echo.
    echo ❌ Error en la integración
    echo.
    pause
    exit /b 1
)

echo.
echo [2/2] 🚀 ¿Deseas reiniciar el bot ahora? (S/N)
set /p REINICIAR=

if /i "%REINICIAR%"=="S" (
    echo.
    echo 🚀 Reiniciando bot...
    echo.
    echo ⚠️ Presiona Ctrl+C para detener el bot cuando quieras
    echo.
    timeout /t 3 /nobreak >nul
    call npm run dev
) else (
    echo.
    echo ℹ️ Para reiniciar el bot manualmente, ejecuta:
    echo    npm run dev
    echo.
    pause
)

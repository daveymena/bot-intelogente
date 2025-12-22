@echo off
echo ========================================
echo ACTUALIZAR DEPENDENCIAS Y EJECUTAR BOT
echo ========================================
echo.

echo Paso 1: Actualizando Baileys a la última versión...
echo.
npm install @whiskeysockets/baileys@latest --legacy-peer-deps
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error actualizando Baileys
    pause
    exit /b 1
)

echo ✅ Baileys actualizado
echo.

echo Paso 2: Verificando otras dependencias críticas...
echo.
npm install @hapi/boom pino qrcode --legacy-peer-deps
echo.

echo ✅ Dependencias verificadas
echo.

echo ========================================
echo.
echo ¿Qué deseas hacer?
echo.
echo 1. Probar Baileys en terminal (test simple)
echo 2. Iniciar bot completo con dashboard
echo 3. Salir
echo.
set /p opcion="Selecciona una opción (1-3): "

if "%opcion%"=="1" (
    echo.
    echo Iniciando test simple de Baileys...
    echo.
    node test-baileys-simple.js
) else if "%opcion%"=="2" (
    echo.
    echo Iniciando bot completo...
    echo.
    call iniciar-bot-baileys.bat
) else (
    echo.
    echo Saliendo...
    exit /b 0
)

pause

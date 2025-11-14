@echo off
echo ========================================
echo INSTALAR BAILEYS Y PROBAR
echo ========================================
echo.

echo Paso 1: Instalando Baileys y dependencias...
echo.
npm install @whiskeysockets/baileys@latest @hapi/boom pino
echo.

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error instalando paquetes
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Paquetes instalados exitosamente
echo.
echo ========================================
echo.

echo Paso 2: Probando Baileys...
echo.
npx tsx scripts/probar-baileys.ts
echo.

pause

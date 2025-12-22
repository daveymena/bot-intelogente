@echo off
echo ========================================
echo   PROBAR FOTOS CARD - CURSO DE PIANO
echo ========================================
echo.

echo [1/3] Verificando URLs de fotos...
node verificar-urls-fotos.js
echo.

echo [2/3] Compilando cambios...
call npm run build:server
echo.

echo [3/3] LISTO PARA PROBAR
echo.
echo ========================================
echo   INSTRUCCIONES:
echo ========================================
echo.
echo 1. Asegurate que el servidor este corriendo:
echo    npm run dev
echo.
echo 2. Envia este mensaje en WhatsApp:
echo    "tienes curso de piano?"
echo.
echo 3. Deberias recibir:
echo    - Foto del curso de piano
echo    - Caption con formato CARD profesional
echo    - Precio: 60,000 COP
echo.
echo ========================================

pause

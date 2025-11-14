@echo off
echo ========================================
echo DIAGNOSTICO COMPLETO DE WHATSAPP
echo ========================================
echo.

echo Paso 1: Detén el servidor (Ctrl+C en la ventana del servidor)
echo.
pause
echo.

echo Paso 2: Limpiando archivos bloqueados...
echo.
call limpiar-archivos-bloqueados.bat
echo.

echo Paso 3: Probando WhatsApp Web.js directamente...
echo.
echo Este test verificará si WhatsApp Web.js puede generar QR
echo.
npx tsx scripts/test-whatsapp-directo.ts
echo.

echo ========================================
echo.
echo Si el test anterior generó un QR exitosamente,
echo el problema está en el servidor, no en WhatsApp Web.js
echo.
echo Si NO generó QR, hay un problema con:
echo - Puppeteer/Chrome
echo - Conexión a internet
echo - Firewall/Antivirus
echo.
pause

@echo off
echo ========================================
echo ARREGLO RAPIDO - BOT NO RESPONDE
echo ========================================
echo.
echo Problema detectado: WhatsApp no esta conectado
echo.
echo Pasos a seguir:
echo.
echo 1. Arreglar login
echo 2. Conectar WhatsApp
echo 3. Probar bot
echo.
echo ========================================
echo.

echo Paso 1: Arreglando credenciales de login...
echo.
npx tsx scripts/arreglar-login.ts
echo.
echo.

echo ========================================
echo Paso 2: Conectar WhatsApp
echo ========================================
echo.
echo Ahora necesitas:
echo 1. Abrir http://localhost:3000
echo 2. Iniciar sesion con:
echo    Email: daveymena16@gmail.com
echo    Password: Davey2020
echo 3. Ir a la seccion de WhatsApp
echo 4. Escanear el codigo QR
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause > nul
start http://localhost:3000
echo.
echo ========================================
echo.
echo Una vez conectado WhatsApp:
echo 1. Envia un mensaje de prueba por WhatsApp
echo 2. Observa los logs en la consola del servidor
echo 3. El bot deberia responder automaticamente
echo.
echo ========================================
pause

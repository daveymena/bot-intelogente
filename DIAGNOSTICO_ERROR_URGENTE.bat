@echo off
echo.
echo ========================================
echo   DIAGNOSTICO DE ERROR URGENTE
echo ========================================
echo.
echo Por favor, sigue estos pasos:
echo.
echo 1. DETENER el servidor (Ctrl+C)
echo.
echo 2. INICIAR el servidor con logs completos:
echo    npm run dev
echo.
echo 3. ENVIAR mensaje "Hola" por WhatsApp
echo.
echo 4. COPIAR TODO lo que aparece en la consola
echo    (especialmente lineas con [Baileys] y Error)
echo.
echo 5. PEGAR los logs aqui para analizar
echo.
echo ========================================
echo.
echo BUSCAR ESPECIFICAMENTE:
echo - [Baileys] lineas
echo - Error: ...
echo - at ... (stack traces)
echo - SimpleConversationHandler
echo.
pause

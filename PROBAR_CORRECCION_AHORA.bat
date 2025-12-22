@echo off
echo.
echo ========================================
echo   PROBAR CORRECCION DEL BOT
echo ========================================
echo.
echo Este script verifica que el bot funcione correctamente
echo despues de la correccion de integracion.
echo.
echo PASOS:
echo 1. Asegurate de que el servidor este corriendo (npm run dev)
echo 2. Conecta WhatsApp desde el dashboard
echo 3. Envia este mensaje: "Tienes el curso de piano disponible?"
echo.
echo RESULTADO ESPERADO:
echo - El bot debe responder con informacion completa del producto
echo - Debe enviar la foto del producto en formato CARD
echo - Debe mostrar el precio real: 60.000 COP
echo - NO debe mostrar mensaje de error
echo.
echo ========================================
echo.
pause

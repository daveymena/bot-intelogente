@echo off
cls
echo ========================================
echo   REINICIAR Y PROBAR SOLUCION COMPLETA
echo ========================================
echo.

echo [PASO 1] Cerrando puertos ocupados...
echo.
call CERRAR_PUERTOS_AHORA.bat
echo.

echo [PASO 2] Verificando configuracion...
echo.
node verificar-curso-piano-detallado.js
echo.

echo [PASO 3] Ejecutando test de conversacion...
echo.
node test-conversacion-curso-piano-final.js
echo.

echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes iniciar el servidor con:
echo   npm run dev
echo.
echo Y probar en WhatsApp enviando:
echo   "Quiero el curso de piano"
echo.
echo El bot debe responder INMEDIATAMENTE con:
echo   - Nombre del producto
echo   - Precio
echo   - Descripcion completa
echo   - Foto del producto
echo   - Opcion de pago
echo.

pause

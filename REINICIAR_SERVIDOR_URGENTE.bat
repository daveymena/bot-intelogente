@echo off
cls
echo ========================================
echo   REINICIAR SERVIDOR - CORRECCION URGENTE
echo ========================================
echo.

echo [1/3] Cerrando puertos...
call CERRAR_PUERTOS_AHORA.bat
echo.

echo [2/3] Verificando correccion...
node test-correccion-urgente-piano.js
echo.

echo ========================================
echo   LISTO PARA REINICIAR
echo ========================================
echo.
echo Ahora ejecuta:
echo   npm run dev
echo.
echo Y prueba en WhatsApp:
echo   "Quiero el curso de piano"
echo.
echo El bot DEBE responder con:
echo   - Nombre del producto REAL
echo   - Precio REAL
echo   - Descripcion REAL
echo   - SIN preguntas genericas
echo   - SIN mencionar Flowkey, Pianote, etc.
echo.

pause

@echo off
echo.
echo ========================================
echo   REINICIANDO SERVIDOR CON CAMBIOS
echo ========================================
echo.
echo Cerrando puertos...
call CERRAR_PUERTOS_AHORA.bat

echo.
echo Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo.
echo Iniciando servidor con SimpleConversationHandler...
echo.
start cmd /k "npm run dev"

echo.
echo ========================================
echo   SERVIDOR REINICIADO
echo ========================================
echo.
echo El servidor se esta iniciando en otra ventana...
echo Espera 10 segundos y prueba en WhatsApp:
echo.
echo   "Tienes el curso de piano disponible?"
echo.
pause

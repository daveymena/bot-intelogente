@echo off
echo ========================================
echo  REINICIAR BOT CON TOLERANCIA A ERRORES
echo ========================================
echo.
echo Este script reinicia el bot con el nuevo
echo sistema de tolerancia a errores integrado.
echo.
echo Cambios aplicados:
echo - Normalizacion automatica de mensajes
echo - Correccion de errores ortograficos
echo - Busqueda inteligente con IA
echo - Razonamiento semantico
echo.
echo ========================================
echo.

echo Deteniendo servidor actual...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Limpiando cache...
if exist .next\cache rmdir /s /q .next\cache

echo.
echo Iniciando servidor con cambios...
echo.
echo ========================================
echo  SERVIDOR INICIANDO...
echo ========================================
echo.
echo Prueba enviando por WhatsApp:
echo "Me interesa el mega pack de idioma"
echo.
echo Deberia encontrar: Megapack de Idiomas
echo.
echo ========================================
echo.

npm run dev

pause

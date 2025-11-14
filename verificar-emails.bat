@echo off
echo ========================================
echo   VERIFICAR EMAILS A daveymena16@gmail.com
echo ========================================
echo.
echo Este script enviara un email de prueba
echo para verificar que los mensajes llegan.
echo.
echo Destinatario: daveymena16@gmail.com
echo.
pause
echo.
echo Enviando email de prueba...
npx tsx scripts/verificar-emails-llegan.ts
echo.
echo ========================================
echo   REVISA TU EMAIL AHORA
echo ========================================
echo.
echo Busca en:
echo   - Bandeja de entrada
echo   - Spam / Correo no deseado
echo   - Promociones
echo.
pause

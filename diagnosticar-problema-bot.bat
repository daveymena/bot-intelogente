@echo off
echo ========================================
echo DIAGNOSTICO COMPLETO DEL PROBLEMA
echo ========================================
echo.

echo 1. Probando si la IA puede generar respuestas...
echo.
npx tsx scripts/test-respuesta-manual.ts
echo.
echo.

echo ========================================
echo 2. Ahora envia un mensaje por WhatsApp
echo    y ejecuta el monitor en tiempo real:
echo.
echo    npx tsx scripts/monitorear-bot-tiempo-real.ts
echo.
echo ========================================
pause

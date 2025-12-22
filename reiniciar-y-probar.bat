@echo off
echo ========================================
echo REINICIANDO SERVIDOR CON LOGS DETALLADOS
echo ========================================
echo.
echo 1. Detén el servidor actual (Ctrl+C si está corriendo)
echo 2. Ejecuta: npm run dev
echo 3. Envía un mensaje por WhatsApp
echo 4. Observa los logs en la consola
echo.
echo Los logs ahora mostrarán EXACTAMENTE dónde se detiene el bot
echo.
echo ========================================
echo.
echo Presiona cualquier tecla cuando hayas reiniciado el servidor
echo y enviado un mensaje por WhatsApp...
pause > nul
echo.
echo Ahora ejecuta el monitor en tiempo real:
echo.
npx tsx scripts/monitorear-bot-tiempo-real.ts

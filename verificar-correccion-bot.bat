@echo off
echo ========================================
echo VERIFICAR CORRECCION BOT
echo ========================================
echo.

echo [1/3] Verificando productos en BD...
npx tsx scripts/ver-productos.ts
echo.

echo [2/3] Probando sistema hibrido...
npx tsx scripts/test-bot-usa-bd-ollama.ts
echo.

echo [3/3] Verificando Ollama...
curl http://localhost:11434/api/tags
echo.

echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Siguiente paso: Reiniciar el bot
echo   npm run dev
echo.
pause

@echo off
echo ========================================
echo   SINCRONIZAR TIENDA Y BOT
echo ========================================
echo.
echo Este script va a:
echo 1. Eliminar productos duplicados
echo 2. Actualizar imagenes de megapacks
echo 3. Sincronizar catalogo
echo.
echo Presiona cualquier tecla para continuar...
pause > nul
echo.

npx tsx scripts/sincronizar-tienda-bot.ts

echo.
echo ========================================
echo   SINCRONIZACION COMPLETADA
echo ========================================
pause

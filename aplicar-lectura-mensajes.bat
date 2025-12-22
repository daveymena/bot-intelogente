@echo off
echo ========================================
echo APLICAR LECTURA AUTOMATICA DE MENSAJES
echo ========================================
echo.

echo Abriendo archivo para editar...
code src/lib/baileys-stable-service.ts:433

echo.
echo INSTRUCCIONES:
echo 1. Busca la linea 433 (aprox): console.log Mensaje procesado
echo 2. DESPUES de esa linea, agrega:
echo.
echo // MARCAR MENSAJE COMO LEIDO INMEDIATAMENTE
echo try {
echo   await socket.readMessages([message.key])
echo   console.log('[Baileys] Mensaje marcado como leido')
echo } catch (readError) {
echo   console.log('[Baileys] No se pudo marcar como leido')
echo }
echo.
echo 3. Guarda el archivo
echo 4. Ejecuta: npm run build:server
echo 5. Reinicia: npm run dev
echo.
pause

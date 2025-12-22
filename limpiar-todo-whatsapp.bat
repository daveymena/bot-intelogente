@echo off
echo ========================================
echo   LIMPIEZA COMPLETA DE WHATSAPP
echo ========================================
echo.
echo ADVERTENCIA: Este script eliminara:
echo   - Todas las conexiones de WhatsApp
echo   - Todos los usuarios (excepto admin)
echo   - Todas las conversaciones y mensajes
echo   - Todos los archivos de sesion
echo   - Toda la cola de mensajes
echo.
echo Esto NO se puede deshacer.
echo.
pause
echo.
echo Ejecutando limpieza completa...
npx tsx scripts/limpiar-todo-whatsapp.ts
echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
echo Ahora puedes:
echo   1. Reiniciar el servidor con: npm run dev
echo   2. Escanear el codigo QR nuevamente
echo   3. Empezar desde cero
echo.
pause

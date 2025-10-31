@echo off
echo ========================================
echo   APLICAR MIGRACION - COLA DE MENSAJES
echo ========================================
echo.

echo Deteniendo procesos de Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Generando cliente de Prisma...
call npx prisma generate

echo.
echo Aplicando migracion...
call npx prisma db push

echo.
echo ========================================
echo   MIGRACION COMPLETADA
echo ========================================
echo.
echo Sistema de cola de mensajes configurado:
echo - Mensajes se guardan en cola si bot desconectado
echo - Procesamiento automatico al reconectar
echo - Maximo 3 intentos por mensaje
echo - Limpieza automatica (7 dias)
echo.
echo Ahora puedes reiniciar el bot.
echo.
pause

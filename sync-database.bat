@echo off
echo ========================================
echo Sincronizando Base de Datos con Schema
echo ========================================
echo.

echo 1. Generando cliente Prisma...
call npx prisma generate

echo.
echo 2. Aplicando cambios al schema...
call npx prisma db push --accept-data-loss

echo.
echo 3. Verificando estado de WhatsApp...
node verificar-estado-whatsapp.js

echo.
echo ========================================
echo Base de datos sincronizada exitosamente
echo ========================================
echo.
echo Proximos pasos:
echo - Reinicia el servidor: npm run dev
echo - Verifica conexion WhatsApp en el dashboard
echo.
pause

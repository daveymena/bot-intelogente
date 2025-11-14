@echo off
echo ========================================
echo   APLICAR MIGRACION DE FLUJOS DE VENTA
echo ========================================
echo.

echo Generando cliente de Prisma...
npx prisma generate

echo.
echo Aplicando migracion a la base de datos...
npx prisma db push

echo.
echo ========================================
echo   MIGRACION COMPLETADA
echo ========================================
echo.
echo El sistema de flujos configurables esta listo!
echo.
echo Ahora puedes:
echo 1. Ir al dashboard
echo 2. Configurar tu tipo de negocio
echo 3. El bot se adaptara automaticamente
echo.
pause

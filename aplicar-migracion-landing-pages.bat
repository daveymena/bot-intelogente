@echo off
echo ========================================
echo Aplicando Migracion: Landing Pages
echo ========================================
echo.

echo 1. Generando cliente de Prisma...
npx prisma generate

echo.
echo 2. Aplicando migracion a la base de datos...
npx prisma db push

echo.
echo ========================================
echo Migracion completada!
echo ========================================
echo.
echo Ahora puedes usar las landing pages editables con IA
echo.
pause

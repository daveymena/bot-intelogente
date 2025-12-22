@echo off
echo ========================================
echo APLICAR MIGRACION DE IA PERSONALIZABLE
echo ========================================
echo.

echo [1/3] Aplicando migracion SQL...
psql %DATABASE_URL% < prisma\migrations\add_ai_provider_priority.sql

echo.
echo [2/3] Generando cliente de Prisma...
npx prisma generate

echo.
echo [3/3] Verificando migracion...
npx prisma migrate status

echo.
echo ========================================
echo MIGRACION COMPLETADA
echo ========================================
echo.
echo Ahora puedes:
echo 1. Ir al Dashboard
echo 2. Seccion: Configuracion de IA
echo 3. Agregar tus API keys
echo.
pause

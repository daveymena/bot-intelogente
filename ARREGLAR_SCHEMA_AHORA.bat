@echo off
echo ========================================
echo   ARREGLANDO SCHEMA DE PRISMA
echo ========================================
echo.

echo Eliminando modelos duplicados...
powershell -Command "$lines = Get-Content prisma/schema.prisma; $lines[0..($lines.Count - 71)] | Set-Content prisma/schema.prisma"

echo.
echo ✅ Schema arreglado!
echo.

echo Generando cliente de Prisma...
call npx prisma generate

echo.
echo Aplicando cambios a la base de datos...
call npx prisma db push

echo.
echo ========================================
echo   LISTO - Probando sistema
echo ========================================
echo.

call npx tsx scripts/test-notification-system.ts

echo.
pause

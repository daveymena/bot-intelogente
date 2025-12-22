@echo off
echo ========================================
echo CONECTAR A POSTGRESQL EN EASYPANEL
echo ========================================
echo.
echo Credenciales:
echo   Host: 157.173.97.41
echo   Puerto: 5432
echo   Usuario: postgres
echo   Base de datos: davey
echo.

echo [1/3] Cerrando procesos que puedan bloquear archivos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Generando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al generar cliente
    echo Intenta cerrar VS Code y ejecutar nuevamente
    pause
    exit /b 1
)

echo.
echo [3/3] Aplicando schema a PostgreSQL...
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al aplicar schema
    echo Verifica que PostgreSQL este accesible
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ CONECTADO A POSTGRESQL
echo ========================================
echo.
echo Ahora puedes:
echo 1. Ver la base de datos: npx prisma studio
echo 2. Migrar productos: npx tsx migrar-productos-postgres.ts
echo 3. Probar el sistema: npx tsx test-bot-hibrido.ts
echo.
pause

@echo off
REM Script para aplicar el esquema en Windows
REM Uso: scripts\apply-schema.bat

echo 🔧 Aplicando esquema a la base de datos de EasyPanel...
echo.

REM Cargar variables de entorno
if exist .env (
    for /f "delims=" %%x in (.env) do (set "%%x")
)

REM Verificar variables
if "%DB_HOST%"=="" (
    echo ❌ Error: Variables de entorno no configuradas
    echo Asegúrate de tener DB_HOST, DB_USER, DB_NAME en .env
    exit /b 1
)

echo 📡 Conectando a: %DB_HOST%:%DB_PORT%
echo 🗄️  Base de datos: %DB_NAME%
echo.

REM Aplicar esquema usando psql (debe estar instalado)
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f src/database/init-schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Esquema aplicado exitosamente
    echo.
    echo 📋 Próximos pasos:
    echo 1. Prueba la conexión: node scripts/test-db-connection.js
    echo 2. Inicia el bot: npm run bot:dev
) else (
    echo.
    echo ❌ Error al aplicar el esquema
    echo Verifica la conexión y los permisos
    echo.
    echo 💡 Si no tienes psql instalado:
    echo    - Descarga PostgreSQL desde https://www.postgresql.org/download/
    echo    - O usa un cliente GUI como pgAdmin o DBeaver
    exit /b 1
)

pause

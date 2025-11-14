@echo off
REM ========================================
REM 🔌 CONECTAR A POSTGRESQL CON PSQL
REM ========================================
REM
REM Este script te ayuda a conectarte usando psql
REM
REM REQUISITOS:
REM 1. Tener PostgreSQL instalado localmente
REM 2. O usar Docker: docker run -it --rm postgres:15 psql
REM
REM USO:
REM 1. Edita las variables abajo con tus datos
REM 2. Ejecuta: test-postgres-psql.bat
REM ========================================

echo.
echo ╔════════════════════════════════════════╗
echo ║  CONECTAR A POSTGRESQL CON PSQL        ║
echo ╚════════════════════════════════════════╝
echo.

REM ========================================
REM 🔧 CONFIGURACIÓN - EDITA ESTOS VALORES
REM ========================================

set DB_HOST=157.173.97.41
set DB_PORT=5432
set DB_USER=postgres
set DB_PASSWORD=9feb7a0e7110d6a42e93
set DB_NAME=botwhatsapp

REM ========================================
REM 🚀 CONECTAR
REM ========================================

echo 📋 Configuración:
echo    Host: %DB_HOST%
echo    Puerto: %DB_PORT%
echo    Usuario: %DB_USER%
echo    Base de datos: %DB_NAME%
echo.
echo ⏳ Conectando...
echo.

REM Verificar si psql está instalado
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: psql no está instalado
    echo.
    echo 💡 Opciones:
    echo    1. Instalar PostgreSQL: https://www.postgresql.org/download/windows/
    echo    2. Usar Docker:
    echo       docker run -it --rm postgres:15 psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME%
    echo.
    pause
    exit /b 1
)

REM Conectar con psql
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME%

REM Limpiar variable de entorno
set PGPASSWORD=

echo.
echo ✅ Desconectado
pause

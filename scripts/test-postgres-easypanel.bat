@echo off
REM ========================================
REM 🔌 PROBAR CONEXIÓN A POSTGRESQL EASYPANEL
REM ========================================

echo.
echo ╔════════════════════════════════════════╗
echo ║  PROBAR POSTGRESQL EASYPANEL           ║
echo ╚════════════════════════════════════════╝
echo.

echo 📋 Configuración:
echo    Dominio: sqaoeo.easypanel.host
echo    Usuario: postgres
echo    Base de datos: botwhatsapp
echo.

echo ⚠️  IMPORTANTE:
echo    Antes de ejecutar, debes exponer PostgreSQL en Easypanel
echo    Ve a: https://sqaoeo.easypanel.host
echo    Servicio PostgreSQL → Domains/Expose → Habilitar puerto 5432
echo.

pause

echo.
echo 🚀 Ejecutando script de prueba...
echo.

npx tsx scripts/test-postgres-connection.ts

echo.
pause

@echo off
echo ================================================================
echo ACTUALIZACION COMPLETA - ELIMINAR SQLITE Y SUBIR A GIT
echo ================================================================
echo.
echo Este script va a:
echo 1. Verificar y eliminar archivos SQLite
echo 2. Actualizar .gitignore
echo 3. Verificar configuracion PostgreSQL
echo 4. Limpiar cache de Git
echo 5. Crear commit y subir cambios
echo.
echo ================================================================
pause
echo.

npx tsx scripts/actualizar-git-sin-sqlite.ts

echo.
echo ================================================================
pause

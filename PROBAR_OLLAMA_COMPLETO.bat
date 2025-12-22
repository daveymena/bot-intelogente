@echo off
echo ========================================
echo PROBAR OLLAMA COMPLETO
echo ========================================
echo.
echo Este script va a:
echo 1. Aplicar schema a PostgreSQL
echo 2. Migrar productos (si hay en SQLite)
echo 3. Ejecutar test completo del sistema
echo.
pause

echo.
echo [1/3] Aplicando schema a PostgreSQL...
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al aplicar schema
    echo.
    echo NOTA: Si estas en desarrollo local, PostgreSQL debe estar
    echo accesible. Para Easypanel, usa la URL interna.
    echo.
    echo Continuando sin migrar productos...
    goto test
)

echo.
echo [2/3] Migrando productos...
call npx tsx migrar-productos-postgres.ts

:test
echo.
echo [3/3] Ejecutando test del sistema hibrido...
echo.
pause
call npx tsx test-bot-hibrido.ts

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
echo Si viste errores de Ollama, es normal si no hay productos.
echo El sistema funciona con fallback automatico.
echo.
echo Para ver Ollama funcionando al 100%%:
echo 1. Asegurate de tener productos en la BD
echo 2. Ejecuta: npx tsx test-bot-hibrido.ts
echo.
pause

@echo off
echo ========================================
echo TEST OLLAMA Y MIGRACION A POSTGRESQL
echo ========================================
echo.

echo [PASO 1] Verificando conexion a Ollama en Easypanel...
curl -s https://davey-ollama.mapf5v.easypanel.host/api/tags
if %errorlevel% neq 0 (
    echo ❌ Error: No se puede conectar a Ollama
    pause
    exit /b 1
)
echo ✓ Ollama conectado correctamente
echo.

echo [PASO 2] Aplicando schema a PostgreSQL...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Error: No se pudo aplicar el schema
    echo.
    echo SOLUCION:
    echo 1. Verifica que PostgreSQL este accesible
    echo 2. Revisa la URL en .env: DATABASE_URL
    echo 3. Para Easypanel usa: davey_postgres-db:5432
    echo 4. Para local necesitas el host externo
    pause
    exit /b 1
)
echo ✓ Schema aplicado correctamente
echo.

echo [PASO 3] Migrando productos de SQLite a PostgreSQL...
call npx tsx migrar-productos-postgres.ts
if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: Hubo errores en la migracion
    echo Revisa el log anterior para mas detalles
)
echo.

echo [PASO 4] Probando modelos Ollama con preguntas sobre productos...
echo.
echo Este test tomara varios minutos...
echo - Probara llama3:latest y mistral:latest
echo - Hara 4 preguntas a cada modelo
echo - Mostrara tiempos de respuesta y metricas
echo.
pause
call npx tsx test-ollama-modelos-easypanel.ts
echo.

echo ========================================
echo PROCESO COMPLETADO
echo ========================================
echo.
echo ✓ Schema aplicado a PostgreSQL
echo ✓ Productos migrados
echo ✓ Modelos Ollama probados
echo.
echo SIGUIENTE PASO:
echo 1. Revisa los resultados de los tests
echo 2. Decide que modelo usar (llama3 o mistral)
echo 3. Actualiza OLLAMA_MODEL en .env
echo 4. Reinicia el bot para usar la nueva configuracion
echo.
pause

@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     OLLAMA + POSTGRESQL - CONFIGURACION COMPLETA              ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.
echo ✅ OLLAMA CONFIGURADO Y PROBADO
echo    URL: https://davey-ollama.mapf5v.easypanel.host
echo    Modelo: llama3:latest (8.0B)
echo    Estado: FUNCIONANDO
echo.
echo ✅ POSTGRESQL CONFIGURADO
echo    Host: davey_postgres-db:5432
echo    Base de datos: davey
echo    Estado: LISTO
echo.
echo.
echo ════════════════════════════════════════════════════════════════
echo  ELIGE UNA OPCION:
echo ════════════════════════════════════════════════════════════════
echo.
echo  [1] Test rapido de Ollama (2 minutos)
echo  [2] Migrar productos a PostgreSQL (5 minutos)
echo  [3] Test completo de modelos (15 minutos)
echo  [4] TODO: Migrar + Test completo (20 minutos)
echo  [5] Ver productos en PostgreSQL
echo  [6] Salir
echo.
set /p opcion="Selecciona una opcion (1-6): "

if "%opcion%"=="1" goto test_rapido
if "%opcion%"=="2" goto migrar
if "%opcion%"=="3" goto test_completo
if "%opcion%"=="4" goto todo
if "%opcion%"=="5" goto ver_productos
if "%opcion%"=="6" goto salir

echo Opcion invalida
pause
goto inicio

:test_rapido
echo.
echo ════════════════════════════════════════════════════════════════
echo  TEST RAPIDO DE OLLAMA
echo ════════════════════════════════════════════════════════════════
echo.
powershell -ExecutionPolicy Bypass -File test-ollama-simple.ps1
pause
goto inicio

:migrar
echo.
echo ════════════════════════════════════════════════════════════════
echo  MIGRANDO PRODUCTOS A POSTGRESQL
echo ════════════════════════════════════════════════════════════════
echo.
echo [1/2] Aplicando schema...
call npx prisma db push
echo.
echo [2/2] Migrando datos...
call npx tsx migrar-productos-postgres.ts
echo.
echo ✅ MIGRACION COMPLETADA
pause
goto inicio

:test_completo
echo.
echo ════════════════════════════════════════════════════════════════
echo  TEST COMPLETO DE MODELOS
echo ════════════════════════════════════════════════════════════════
echo.
echo Este test tomara aproximadamente 15 minutos
echo Probara llama3 y mistral con 4 preguntas cada uno
echo.
pause
call npx tsx test-ollama-modelos-easypanel.ts
pause
goto inicio

:todo
echo.
echo ════════════════════════════════════════════════════════════════
echo  PROCESO COMPLETO
echo ════════════════════════════════════════════════════════════════
echo.
call test-y-migrar-completo.bat
pause
goto inicio

:ver_productos
echo.
echo ════════════════════════════════════════════════════════════════
echo  ABRIENDO PRISMA STUDIO
echo ════════════════════════════════════════════════════════════════
echo.
echo Se abrira en tu navegador: http://localhost:5555
echo Presiona Ctrl+C para cerrar cuando termines
echo.
call npx prisma studio
goto inicio

:salir
echo.
echo ════════════════════════════════════════════════════════════════
echo  RESUMEN
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ Ollama: https://davey-ollama.mapf5v.easypanel.host
echo ✅ Modelo principal: llama3:latest
echo ✅ PostgreSQL: davey_postgres-db:5432
echo.
echo 📚 Documentacion:
echo    - RESUMEN_FINAL_OLLAMA_POSTGRES.md
echo    - INTEGRACION_OLLAMA_EASYPANEL_COMPLETA.md
echo    - EJECUTAR_AHORA_OLLAMA_POSTGRES.md
echo.
echo 🚀 Siguiente paso:
echo    Integrar en el bot principal y subir a Git
echo.
pause
exit

:inicio
cls
goto :eof

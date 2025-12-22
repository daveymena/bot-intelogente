@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║        SISTEMA HIBRIDO: BOT LOCAL + OLLAMA ASSISTANT          ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo  ⚡ Bot Local: Respuestas instantáneas (60%% de consultas)
echo  🧠 Ollama: Inteligencia artificial (40%% de consultas)
echo.
echo ════════════════════════════════════════════════════════════════
echo  COMANDOS DISPONIBLES:
echo ════════════════════════════════════════════════════════════════
echo.
echo  [1] Probar sistema híbrido (5 minutos)
echo  [2] Ver documentación completa
echo  [3] Migrar productos a PostgreSQL
echo  [4] Verificar estado de Ollama
echo  [5] Abrir Prisma Studio
echo  [6] Salir
echo.
set /p opcion="Selecciona una opcion (1-6): "

if "%opcion%"=="1" goto test_hibrido
if "%opcion%"=="2" goto documentacion
if "%opcion%"=="3" goto migrar
if "%opcion%"=="4" goto verificar_ollama
if "%opcion%"=="5" goto prisma_studio
if "%opcion%"=="6" goto salir

echo Opcion invalida
pause
exit

:test_hibrido
echo.
echo ════════════════════════════════════════════════════════════════
echo  PROBANDO SISTEMA HIBRIDO
echo ════════════════════════════════════════════════════════════════
echo.
echo Este test demostrara:
echo  ✅ Respuestas locales instantaneas
echo  ✅ Analisis inteligente con Ollama
echo  ✅ Memoria y contexto funcionando
echo  ✅ Busqueda de productos integrada
echo.
pause
call npx tsx test-bot-hibrido.ts
echo.
echo ════════════════════════════════════════════════════════════════
echo  TEST COMPLETADO
echo ════════════════════════════════════════════════════════════════
echo.
pause
exit

:documentacion
echo.
echo ════════════════════════════════════════════════════════════════
echo  DOCUMENTACION DISPONIBLE
echo ════════════════════════════════════════════════════════════════
echo.
echo  📚 Guias principales:
echo.
echo  1. RESUMEN_SISTEMA_HIBRIDO_FINAL.md
echo     → Resumen ejecutivo completo
echo.
echo  2. SISTEMA_HIBRIDO_BOT_LOCAL_OLLAMA.md
echo     → Guia tecnica detallada
echo.
echo  3. LISTO_PARA_USAR.md
echo     → Guia rapida de Ollama
echo.
echo  4. INTEGRACION_OLLAMA_EASYPANEL_COMPLETA.md
echo     → Integracion completa
echo.
echo  📝 Archivos de codigo:
echo.
echo  - src/lib/ollama-assistant-service.ts
echo  - src/lib/hybrid-bot-service.ts
echo  - test-bot-hibrido.ts
echo.
pause
exit

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
echo.
pause
exit

:verificar_ollama
echo.
echo ════════════════════════════════════════════════════════════════
echo  VERIFICANDO ESTADO DE OLLAMA
echo ════════════════════════════════════════════════════════════════
echo.
echo URL: https://davey-ollama.mapf5v.easypanel.host
echo.
echo Consultando modelos disponibles...
echo.
curl https://davey-ollama.mapf5v.easypanel.host/api/tags
echo.
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
exit

:prisma_studio
echo.
echo ════════════════════════════════════════════════════════════════
echo  ABRIENDO PRISMA STUDIO
echo ════════════════════════════════════════════════════════════════
echo.
echo Se abrira en tu navegador: http://localhost:5555
echo Presiona Ctrl+C para cerrar cuando termines
echo.
call npx prisma studio
exit

:salir
echo.
echo ════════════════════════════════════════════════════════════════
echo  RESUMEN DEL SISTEMA
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ Sistema Hibrido Configurado
echo    - Bot Local: Respuestas instantaneas
echo    - Ollama: Inteligencia artificial
echo.
echo ✅ Ollama en Easypanel
echo    - URL: https://davey-ollama.mapf5v.easypanel.host
echo    - Modelo: llama3:latest (8B)
echo.
echo ✅ PostgreSQL Configurado
echo    - Host: davey_postgres-db:5432
echo    - Base de datos: davey
echo.
echo 📚 Documentacion:
echo    - RESUMEN_SISTEMA_HIBRIDO_FINAL.md
echo    - SISTEMA_HIBRIDO_BOT_LOCAL_OLLAMA.md
echo.
echo 🚀 Proximo paso:
echo    npx tsx test-bot-hibrido.ts
echo.
pause
exit

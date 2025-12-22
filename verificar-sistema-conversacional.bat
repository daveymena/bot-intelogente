@echo off
echo ========================================
echo VERIFICACION SISTEMA CONVERSACIONAL
echo ========================================
echo.

echo [1/5] Verificando archivos clave...
if exist "src\agents\orchestrator.ts" (
    echo   ✅ Orquestador
) else (
    echo   ❌ Orquestador NO ENCONTRADO
)

if exist "src\lib\intent-detection-service.ts" (
    echo   ✅ Deteccion de Intenciones
) else (
    echo   ❌ Deteccion de Intenciones NO ENCONTRADO
)

if exist "src\lib\objection-handler-service.ts" (
    echo   ✅ Manejo de Objeciones
) else (
    echo   ❌ Manejo de Objeciones NO ENCONTRADO
)

if exist "src\lib\conversation-learning-service.ts" (
    echo   ✅ Aprendizaje Continuo
) else (
    echo   ❌ Aprendizaje Continuo NO ENCONTRADO
)

if exist "src\lib\unified-memory-service.ts" (
    echo   ✅ Memoria Unificada
) else (
    echo   ❌ Memoria Unificada NO ENCONTRADO
)

if exist "src\lib\persistent-memory-service.ts" (
    echo   ✅ Memoria Persistente
) else (
    echo   ❌ Memoria Persistente NO ENCONTRADO
)

echo.
echo [2/5] Verificando agentes especializados...
if exist "src\agents\search-agent.ts" (
    echo   ✅ Search Agent
) else (
    echo   ❌ Search Agent NO ENCONTRADO
)

if exist "src\agents\product-agent.ts" (
    echo   ✅ Product Agent
) else (
    echo   ❌ Product Agent NO ENCONTRADO
)

if exist "src\agents\photo-agent.ts" (
    echo   ✅ Photo Agent
) else (
    echo   ❌ Photo Agent NO ENCONTRADO
)

if exist "src\agents\deep-reasoning-agent.ts" (
    echo   ✅ Deep Reasoning Agent
) else (
    echo   ❌ Deep Reasoning Agent NO ENCONTRADO
)

echo.
echo [3/5] Verificando tests...
if exist "test-sistema-completo-final.ts" (
    echo   ✅ Test Sistema Completo
) else (
    echo   ❌ Test Sistema Completo NO ENCONTRADO
)

if exist "test-contexto-producto-corregido.ts" (
    echo   ✅ Test Contexto Producto
) else (
    echo   ❌ Test Contexto Producto NO ENCONTRADO
)

echo.
echo [4/5] Verificando documentacion...
if exist "SISTEMA_COMPLETO_FINAL_21_NOV.md" (
    echo   ✅ Documentacion Sistema
) else (
    echo   ❌ Documentacion Sistema NO ENCONTRADA
)

if exist "GUIA_SISTEMA_CONVERSACIONAL_PERFECTO.md" (
    echo   ✅ Guia Conversacional
) else (
    echo   ❌ Guia Conversacional NO ENCONTRADA
)

echo.
echo [5/5] Ejecutando test rapido...
echo.
npx tsx test-contexto-producto-corregido.ts

echo.
echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Para probar el sistema completo:
echo   npx tsx test-sistema-completo-final.ts
echo.
echo Para iniciar el bot:
echo   npm run dev
echo.
pause

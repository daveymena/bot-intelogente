@echo off
echo ========================================
echo SUBIR CAMBIOS A GIT - 20 NOV 2025
echo ========================================
echo.

echo [1/5] Verificando estado de Git...
git status

echo.
echo [2/5] Agregando archivos modificados...
git add src/agents/shared-memory.ts
git add src/agents/payment-agent.ts
git add src/agents/search-agent.ts
git add src/agents/product-agent.ts
git add src/agents/utils/intent-detector.ts
git add RESUMEN_CAMBIOS_20_NOV_2025.md
git add CORRECCION_MEMORIA_COMPARTIDA_COMPLETA.md
git add CORRECCION_PRIORIDAD_INTENCIONES.md
git add CORRECCION_BUSQUEDA_PRODUCTOS_ESPECIFICOS.md
git add SISTEMA_MEMORIA_COMPARTIDA_MEJORADO.md

echo.
echo [3/5] Creando commit...
git commit -m "fix: Correciones criticas sistema de agentes

- Memoria compartida entre agentes
- Prioridad de intenciones corregida
- Busqueda de productos especificos mejorada
- Extraccion de producto en mensaje de pago
- Scoring inteligente para productos unicos

Fixes:
- Bot ahora encuentra productos especificos correctamente
- Seleccion de metodo de pago no busca productos nuevos
- Palabras unicas (piano, guitarra) priorizan productos especificos
- Mega Packs solo aparecen si usuario busca 'pack'
"

echo.
echo [4/5] Verificando commit...
git log -1 --oneline

echo.
echo [5/5] Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo LISTO PARA EASYPANEL
echo ========================================
echo.
echo Siguiente paso:
echo 1. Ve a Easypanel
echo 2. Abre tu proyecto Smart Sales Bot
echo 3. Ve a la seccion "Source"
echo 4. Click en "Rebuild" para actualizar
echo.
pause

#!/bin/bash

echo "🔍 =========================================="
echo "🔍 VERIFICANDO CAMBIOS EN EASYPANEL"
echo "🔍 =========================================="
echo ""

echo "📋 Verificando archivo ai-service.ts..."
if grep -q "INFORMACIÓN COMPLETA LA PRIMERA VEZ" src/lib/ai-service.ts; then
    echo "✅ Cambio 1: Regla de información completa - ENCONTRADO"
else
    echo "❌ Cambio 1: Regla de información completa - NO ENCONTRADO"
fi

if grep -q "Si es la PRIMERA VEZ que mencionas este producto" src/lib/ai-service.ts; then
    echo "✅ Cambio 2: Lógica de primera mención - ENCONTRADO"
else
    echo "❌ Cambio 2: Lógica de primera mención - NO ENCONTRADO"
fi

echo ""
echo "📋 Verificando estructura de rutas..."
if [ ! -d "src/app/tienda/[userId]" ]; then
    echo "✅ Cambio 3: Carpeta [userId] eliminada - CORRECTO"
else
    echo "❌ Cambio 3: Carpeta [userId] aún existe - INCORRECTO"
fi

if [ ! -d "src/app/tienda/[storeSlug]" ]; then
    echo "✅ Cambio 4: Carpeta [storeSlug] eliminada - CORRECTO"
else
    echo "❌ Cambio 4: Carpeta [storeSlug] aún existe - INCORRECTO"
fi

echo ""
echo "📋 Verificando página de producto..."
if grep -q "formatDescription" src/app/tienda/producto/[id]/page.tsx; then
    echo "✅ Cambio 5: Función formatDescription - ENCONTRADO"
else
    echo "❌ Cambio 5: Función formatDescription - NO ENCONTRADO"
fi

echo ""
echo "📋 Último commit:"
git log -1 --oneline

echo ""
echo "📋 Rama actual:"
git branch --show-current

echo ""
echo "🔍 =========================================="
echo "🔍 VERIFICACIÓN COMPLETADA"
echo "🔍 =========================================="

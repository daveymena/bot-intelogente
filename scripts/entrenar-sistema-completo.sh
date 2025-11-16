#!/bin/bash

# Script Maestro de Entrenamiento Completo
# Genera dataset + Entrena red neuronal + Valida

echo "🚀 SISTEMA DE ENTRENAMIENTO COMPLETO"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar servicios
echo -e "${YELLOW}📋 Paso 1: Verificando servicios...${NC}"
echo ""

# Verificar Core AI
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Core AI disponible${NC}"
else
    echo -e "${RED}❌ Core AI no disponible${NC}"
    echo "Iniciando Core AI..."
    docker-compose -f docker-compose.ai.yml up -d core-ai
    sleep 10
fi

# Verificar Qdrant
if curl -s http://localhost:6333/health > /dev/null; then
    echo -e "${GREEN}✅ Qdrant disponible${NC}"
else
    echo -e "${RED}❌ Qdrant no disponible${NC}"
    echo "Iniciando Qdrant..."
    docker-compose -f docker-compose.ai.yml up -d qdrant
    sleep 5
fi

# Verificar Groq API
if [ -z "$GROQ_API_KEY" ]; then
    echo -e "${YELLOW}⚠️ GROQ_API_KEY no configurada${NC}"
    echo "El sistema usará solo Ollama"
else
    echo -e "${GREEN}✅ Groq API configurada${NC}"
fi

echo ""

# 2. Generar dataset
echo -e "${YELLOW}📊 Paso 2: Generando dataset completo...${NC}"
echo "Esto puede tomar 30-60 minutos dependiendo de la cantidad de variaciones"
echo ""

npx tsx scripts/generar-dataset-completo.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dataset generado exitosamente${NC}"
else
    echo -e "${RED}❌ Error generando dataset${NC}"
    exit 1
fi

echo ""

# 3. Entrenar red neuronal
echo -e "${YELLOW}🧠 Paso 3: Entrenando red neuronal...${NC}"
echo ""

npx tsx scripts/entrenar-red-neuronal-completa.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Red neuronal entrenada${NC}"
else
    echo -e "${RED}❌ Error entrenando red neuronal${NC}"
    exit 1
fi

echo ""

# 4. Validar sistema
echo -e "${YELLOW}✅ Paso 4: Validando sistema...${NC}"
echo ""

# Test queries
echo "Probando queries de validación..."
echo ""

curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","text":"¿Cuánto cuesta el Macbook?"}' \
  | jq '.'

echo ""

curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","text":"Quiero agendar una cita"}' \
  | jq '.'

echo ""

# 5. Generar reporte final
echo -e "${YELLOW}📊 Paso 5: Generando reporte final...${NC}"
echo ""

# Obtener stats
curl -s http://localhost:8000/stats | jq '.' > data/training/stats_final.json

echo -e "${GREEN}✅ Reporte guardado en data/training/stats_final.json${NC}"
echo ""

# 6. Resumen
echo "======================================"
echo -e "${GREEN}🎉 ENTRENAMIENTO COMPLETADO${NC}"
echo "======================================"
echo ""
echo "📊 Archivos generados:"
echo "   - data/training/dataset_completo_*.json"
echo "   - data/training/intent_training.txt"
echo "   - data/training/conversations.jsonl"
echo "   - data/training/qdrant_documents.json"
echo "   - data/training/reporte_entrenamiento_*.json"
echo "   - data/training/stats_final.json"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Revisar reportes en data/training/"
echo "   2. Probar bot con mensajes reales"
echo "   3. Monitorear accuracy en producción"
echo "   4. Re-entrenar semanalmente"
echo ""
echo "📚 Comandos útiles:"
echo "   - Ver logs: docker logs -f core-ai"
echo "   - Ver stats: curl http://localhost:8000/stats"
echo "   - Test query: curl -X POST http://localhost:8000/query -d '{...}'"
echo ""

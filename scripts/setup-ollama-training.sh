#!/bin/bash

echo "========================================="
echo "CONFIGURACIÓN DE OLLAMA PARA ENTRENAMIENTO"
echo "========================================="
echo ""

# Verificar si Ollama está corriendo
echo "Verificando Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama no está corriendo"
    echo ""
    echo "Inicia Ollama primero:"
    echo "  ollama serve"
    echo ""
    exit 1
fi

echo "✅ Ollama conectado"
echo ""

# Descargar modelos necesarios
echo "📥 Descargando modelos de IA..."
echo ""

echo "1/3 Descargando gemma2:2b (rápido, 1.6GB)..."
ollama pull gemma2:2b

echo ""
echo "2/3 Descargando qwen3:4b (balanceado, 2.5GB)..."
ollama pull qwen3:4b

echo ""
echo "3/3 Descargando gemma3:4b (preciso, 3.3GB)..."
ollama pull gemma3:4b

echo ""
echo "========================================="
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "========================================="
echo ""
echo "Modelos instalados:"
ollama list
echo ""
echo "🎓 Ahora puedes iniciar el entrenamiento:"
echo "   npm run train:24-7"
echo ""
echo "O con Docker:"
echo "   docker-compose -f docker-compose.training.yml up -d"
echo ""

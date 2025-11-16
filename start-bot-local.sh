#!/bin/bash
# Script para iniciar el bot con IA local

echo "=================================="
echo "INICIANDO BOT CON IA LOCAL"
echo "=================================="
echo ""

# Verificar Ollama
echo "Verificando Ollama..."
curl -s http://localhost:11434/api/tags > /dev/null
if [ $? -ne 0 ]; then
  echo "✗ Ollama no está disponible"
  echo "Ejecuta: ollama serve"
  exit 1
fi
echo "✓ Ollama disponible"
echo ""

# Iniciar bot
echo "Iniciando bot..."
npm run dev

echo ""
echo "Bot iniciado con IA local (Ollama)"

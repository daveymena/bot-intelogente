#!/bin/bash

# 🚀 Script para pushear los cambios a GitHub
# Ejecuta este script desde tu máquina local

echo "🔧 Configurando git y haciendo push..."
echo ""

# Verifica que estés en el directorio correcto
if [ ! -d ".git" ]; then
    echo "❌ Error: No estás en el directorio raíz del repositorio"
    exit 1
fi

# Muestra el estado actual
echo "📊 Estado actual:"
git status
echo ""

# Verifica los commits no pusheados
COMMITS=$(git log origin/main..main --oneline | wc -l)
echo "📝 Commits listos para pushear: $COMMITS"
echo ""

# Lista los commits
echo "📋 Commits a pushear:"
git log origin/main..main --oneline
echo ""

# Intenta hacer push
echo "🚀 Haciendo push a GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Push exitoso!"
    echo ""
    echo "Verifica tus cambios en:"
    echo "https://github.com/daveymena/bot-intelogente"
else
    echo ""
    echo "❌ Error al hacer push. Probables causas:"
    echo "1. No tienes conexión a internet"
    echo "2. Necesitas configurar autenticación SSH o HTTPS"
    echo "3. Tu token de GitHub ha expirado"
    echo ""
    echo "💡 Solución:"
    echo "Configura SSH:"
    echo "  ssh-keygen -t ed25519 -C 'tu-email@gmail.com'"
    echo "  cat ~/.ssh/id_ed25519.pub  # Copia esto a GitHub Settings > SSH Keys"
    echo ""
    echo "O usa HTTPS con token:"
    echo "  git remote set-url origin https://tu-token@github.com/daveymena/bot-intelogente.git"
    exit 1
fi

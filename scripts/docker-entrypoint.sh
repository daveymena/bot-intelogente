#!/bin/bash
# ============================================
# DOCKER ENTRYPOINT SCRIPT
# Se ejecuta automáticamente al iniciar el contenedor
# ============================================

set -e

echo "🚀 Iniciando Smart Sales Bot Pro..."

# ============================================
# 1. VERIFICAR VARIABLES DE ENTORNO
# ============================================
echo "📋 Verificando variables de entorno..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está configurada"
  exit 1
fi

if [ -z "$GROQ_API_KEY" ]; then
  echo "⚠️  WARNING: GROQ_API_KEY no está configurada"
  echo "   El bot no podrá funcionar sin al menos una API key"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ ERROR: NEXTAUTH_SECRET no está configurada"
  exit 1
fi

echo "✅ Variables de entorno verificadas"

# ============================================
# 2. ESPERAR A QUE LA BASE DE DATOS ESTÉ LISTA
# ============================================
echo "⏳ Esperando a que PostgreSQL esté listo..."

max_attempts=30
attempt=0

until npx prisma db push --skip-generate 2>/dev/null || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "   Intento $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ ERROR: No se pudo conectar a la base de datos después de $max_attempts intentos"
  exit 1
fi

echo "✅ Base de datos conectada"

# ============================================
# 3. EJECUTAR MIGRACIONES
# ============================================
echo "🔄 Ejecutando migraciones de base de datos..."

npx prisma migrate deploy || {
  echo "⚠️  Migraciones fallaron, intentando con db push..."
  npx prisma db push --skip-generate || {
    echo "❌ ERROR: No se pudieron aplicar las migraciones"
    exit 1
  }
}

echo "✅ Migraciones aplicadas"

# ============================================
# 4. GENERAR PRISMA CLIENT
# ============================================
echo "🔧 Generando Prisma Client..."

npx prisma generate || {
  echo "❌ ERROR: No se pudo generar Prisma Client"
  exit 1
}

echo "✅ Prisma Client generado"

# ============================================
# 5. CREAR DIRECTORIOS NECESARIOS
# ============================================
echo "📁 Creando directorios necesarios..."

mkdir -p /app/auth_sessions
mkdir -p /app/.next/cache
mkdir -p /app/public/uploads

echo "✅ Directorios creados"

# ============================================
# 6. VERIFICAR OPENCLAW
# ============================================
echo "🧠 Verificando OpenClaw..."

if [ -d "/app/.openclaw-workspace" ]; then
  echo "✅ OpenClaw workspace encontrado"
  
  if [ -f "/app/.openclaw-workspace/SOUL.md" ]; then
    echo "✅ SOUL.md encontrado"
  else
    echo "⚠️  SOUL.md no encontrado, usando configuración por defecto"
  fi
else
  echo "⚠️  OpenClaw workspace no encontrado, creando..."
  mkdir -p /app/.openclaw-workspace
  
  # Crear SOUL.md por defecto
  cat > /app/.openclaw-workspace/SOUL.md << 'EOF'
# 🤖 SOUL - Personalidad del Bot

Eres David, un asistente de ventas profesional y amigable.

## Características:
- Profesional pero cercano
- Empático y paciente
- Conocedor de los productos
- Orientado a ayudar al cliente

## Estilo de Comunicación:
- Usa emojis moderadamente (1-2 por mensaje)
- Respuestas concisas pero completas
- Tono colombiano y amigable
- Siempre ofrece ayuda adicional

## Reglas de Oro:
1. Nunca inventes información
2. Si no sabes algo, di que verificarás
3. Mantén el contexto de la conversación
4. Guía al cliente hacia la compra
5. Sé honesto sobre limitaciones
EOF
  
  echo "✅ SOUL.md creado con configuración por defecto"
fi

# ============================================
# 7. MOSTRAR INFORMACIÓN DEL SISTEMA
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 INFORMACIÓN DEL SISTEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Node Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-3000}"
echo "Database: ${DATABASE_URL%%@*}@***"
echo "Groq Keys: $([ -n "$GROQ_API_KEY" ] && echo "✅" || echo "❌") $([ -n "$GROQ_API_KEY_2" ] && echo "✅" || echo "❌") $([ -n "$GROQ_API_KEY_3" ] && echo "✅" || echo "❌") $([ -n "$GROQ_API_KEY_4" ] && echo "✅" || echo "❌") $([ -n "$GROQ_API_KEY_5" ] && echo "✅" || echo "❌")"
echo "MercadoPago: $([ -n "$MERCADOPAGO_ACCESS_TOKEN" ] && echo "✅ Configurado" || echo "❌ No configurado")"
echo "PayPal: $([ -n "$PAYPAL_CLIENT_ID" ] && echo "✅ Configurado" || echo "❌ No configurado")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================
# 8. INICIAR APLICACIÓN
# ============================================
echo "🚀 Iniciando aplicación..."
echo ""

# Ejecutar el comando pasado como argumentos
exec "$@"

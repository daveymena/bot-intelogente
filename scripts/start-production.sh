#!/bin/bash

echo "🚀 Iniciando aplicación en producción..."

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ ERROR: NEXTAUTH_SECRET no está configurada"
    exit 1
fi

# Generar Prisma Client
echo "📦 Generando Prisma Client..."
npx prisma generate

# Ejecutar migraciones (solo en primera ejecución)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Ejecutando migraciones de base de datos..."
    npx prisma migrate deploy
fi

# Crear usuario admin si no existe
if [ "$CREATE_ADMIN" = "true" ]; then
    echo "👤 Creando usuario administrador..."
    npx tsx scripts/create-admin-production.ts
fi

# Iniciar aplicación
echo "✅ Iniciando servidor..."
exec node server.js

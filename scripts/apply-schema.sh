#!/bin/bash

# Script para aplicar el esquema en la base de datos de EasyPanel
# Uso: ./scripts/apply-schema.sh

echo "🔧 Aplicando esquema a la base de datos de EasyPanel..."
echo ""

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Verificar que las variables estén configuradas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Error: Variables de entorno no configuradas"
    echo "Asegúrate de tener DB_HOST, DB_USER, DB_NAME en .env"
    exit 1
fi

echo "📡 Conectando a: $DB_HOST:$DB_PORT"
echo "🗄️  Base de datos: $DB_NAME"
echo ""

# Aplicar esquema
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/database/init-schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Esquema aplicado exitosamente"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Verifica las tablas: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c '\dt'"
    echo "2. Prueba la conexión: node scripts/test-db-connection.js"
    echo "3. Inicia el bot: npm run bot:dev"
else
    echo ""
    echo "❌ Error al aplicar el esquema"
    echo "Verifica la conexión y los permisos"
    exit 1
fi

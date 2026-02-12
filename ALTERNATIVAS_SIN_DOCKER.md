# 🚀 Alternativa: Probar con Base de Datos de EasyPanel

Ya que Docker no está corriendo, podemos intentar conectarnos directamente a EasyPanel.

## Opción 1: Túnel SSH a EasyPanel

Si tienes acceso SSH a EasyPanel, puedes crear un túnel:

```bash
# Crear túnel SSH (reemplaza con tus credenciales)
ssh -L 5432:ollama_postgres-whatsapp:5432 usuario@164.68.122.5

# En otra terminal, ahora puedes conectarte a localhost:5432
# que se redirige a la BD interna de EasyPanel
```

## Opción 2: Usar PostgreSQL Instalado Localmente

Si tienes PostgreSQL instalado en Windows:

```bash
# 1. Abre pgAdmin o psql
# 2. Crea la base de datos
psql -U postgres
CREATE DATABASE whatsappdb;
\q

# 3. Actualiza .env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/whatsappdb"

# 4. Aplica el esquema
npx prisma db push

# 5. Carga productos
npx tsx scripts/seed-products.ts
```

## Opción 3: Usar SQLite (Más Simple)

Para pruebas rápidas, podemos usar SQLite (no requiere servidor):

### 1. Actualizar `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Actualizar `.env`:

```env
DATABASE_URL="file:./dev.db"
```

### 3. Ejecutar:

```bash
npx prisma db push
npx tsx scripts/seed-products.ts
npx tsx test-agent-system.ts
```

## 🎯 Recomendación

**La forma más simple es:**

1. **Abre Docker Desktop** (toma 1-2 minutos)
2. Espera a que inicie
3. Ejecuta: `docker-compose -f docker-compose.local.yml up -d`
4. Continúa con las pruebas

**O si prefieres SQLite** (sin Docker):

1. Cambia `prisma/schema.prisma` a SQLite
2. Ejecuta `npx prisma db push`
3. Listo para probar

¿Cuál prefieres?

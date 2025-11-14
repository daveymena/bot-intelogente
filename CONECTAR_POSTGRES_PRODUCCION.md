# 🔌 Conectar a PostgreSQL de Producción

## ⚠️ ADVERTENCIA

Conectarte a la base de datos de producción desde local es **PELIGROSO**. Solo hazlo si:
- Sabes lo que estás haciendo
- Tienes un backup reciente
- Necesitas hacer cambios masivos

**RECOMENDACIÓN:** Usa el Dashboard de Easypanel en su lugar.

## 📋 Pasos

### 1. Obtener la URL de Conexión

En Easypanel:
1. Ve a tu servicio de PostgreSQL
2. Copia la URL de conexión
3. Debe verse así:
   ```
   postgresql://postgres:PASSWORD@IP_O_DOMINIO:5432/botwhatsapp
   ```

### 2. Actualizar .env Local

Edita tu archivo `.env`:

```bash
# Cambiar de SQLite a PostgreSQL
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:TU_PASSWORD@TU_IP:5432/botwhatsapp?sslmode=disable"
```

**Reemplaza:**
- `TU_PASSWORD` con tu contraseña real
- `TU_IP` con la IP o dominio de Easypanel

### 3. Regenerar Prisma Client

```bash
npx prisma generate
```

### 4. Ejecutar el Script

```bash
npx tsx scripts/actualizar-curso-piano-completo.ts
```

### 5. Volver a SQLite (Opcional)

Si quieres volver a usar SQLite local:

```bash
# En .env
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db

# Regenerar
npx prisma generate
```

## 🔒 Seguridad

### NO subas a Git:
- ❌ La URL de conexión con contraseña
- ❌ El archivo `.env` con datos de producción

### Usa variables de entorno:
- ✅ Mantén `.env` en `.gitignore`
- ✅ Usa `.env.example` para documentar

## 🎯 Alternativa Recomendada

En lugar de conectarte desde local, **usa el Dashboard**:

1. Ve a Easypanel
2. Abre el Dashboard del bot
3. Edita el producto directamente
4. Mucho más seguro y fácil

O ejecuta el script **dentro del contenedor de Easypanel**:

```bash
# Conectar al contenedor
docker exec -it nombre-contenedor sh

# Ejecutar script
npx tsx scripts/actualizar-curso-piano-completo.ts
```

## 📝 Ejemplo Completo

```bash
# 1. Editar .env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@192.168.1.100:5432/botwhatsapp?sslmode=disable"

# 2. Regenerar Prisma
npx prisma generate

# 3. Ejecutar script
npx tsx scripts/actualizar-curso-piano-completo.ts

# 4. Volver a SQLite
DATABASE_URL=file:./dev.db
npx prisma generate
```

## ⚡ Opción Más Rápida

**Actualiza desde el Dashboard** siguiendo `ACTUALIZAR_CURSO_PIANO_EASYPANEL.md`

Es más seguro, más fácil y no requiere configuración.

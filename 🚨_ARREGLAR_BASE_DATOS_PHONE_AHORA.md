# 🚨 Arreglar Error: Column phone no existe

## ❌ Error

```
Invalid `prisma.user.findUnique()` invocation:
The column `users.phone` does not exist in the current database.
```

## 🔍 Causa

Tu schema de Prisma tiene el campo `phone` definido, pero la base de datos no está sincronizada.

## ✅ Solución Rápida

### Opción 1: Prisma DB Push (Desarrollo - Recomendado)

```bash
# Sincronizar schema con base de datos
npx prisma db push

# Regenerar cliente de Prisma
npx prisma generate
```

### Opción 2: Crear Migración (Producción)

```bash
# Crear migración
npx prisma migrate dev --name add-phone-field

# Aplicar migración
npx prisma migrate deploy
```

## 📋 Pasos Detallados

### PASO 1: Verificar Schema

El schema ya tiene el campo definido:

```prisma
model User {
  id       String  @id @default(cuid())
  email    String  @unique
  name     String?
  phone    String?  // ✅ Ya está definido
  password String
  // ...
}
```

### PASO 2: Sincronizar Base de Datos

**Si estás en desarrollo (local):**

```bash
# Sincronizar directamente
npx prisma db push
```

**Si estás en producción (Easypanel):**

```bash
# Crear migración
npx prisma migrate dev --name add-phone-field

# Commit y push
git add .
git commit -m "fix: add phone field migration"
git push origin main

# En Easypanel, ejecutar en Console:
npx prisma migrate deploy
```

### PASO 3: Regenerar Cliente

```bash
npx prisma generate
```

### PASO 4: Reiniciar Servidor

```bash
# Local
npm run dev

# Easypanel
# Rebuild automático o manual
```

## 🔧 Si el Error Persiste

### Verificar Conexión a Base de Datos

```bash
# Probar conexión
npx prisma db pull

# Ver estado de migraciones
npx prisma migrate status
```

### Resetear Base de Datos (Solo Desarrollo)

```bash
# ⚠️ CUIDADO: Esto borra todos los datos
npx prisma migrate reset

# Confirmar con 'y'
```

### Agregar Campo Manualmente (SQL)

Si prefieres hacerlo manualmente:

```sql
-- Conectar a PostgreSQL
psql $DATABASE_URL

-- Agregar columna phone
ALTER TABLE users ADD COLUMN phone VARCHAR(255);

-- Verificar
\d users
```

## 📊 Para Easypanel

### Opción A: Desde Console

1. Ir a Easypanel → Tu app → "Console"
2. Ejecutar:

```bash
npx prisma db push
npx prisma generate
```

3. Rebuild la app

### Opción B: Desde Local

1. Crear migración local:

```bash
npx prisma migrate dev --name add-phone-field
```

2. Commit y push:

```bash
git add prisma/migrations
git commit -m "fix: add phone field migration"
git push origin main
```

3. En Easypanel Console:

```bash
npx prisma migrate deploy
```

4. Rebuild la app

## ✅ Verificar que Funcionó

```bash
# Probar query
npx prisma studio

# O ejecutar script de prueba
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst().then(user => {
  console.log('✅ Campo phone existe:', user);
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
```

## 🚨 Troubleshooting

### Error: "Migration failed"

**Causa:** Hay datos existentes que no son compatibles

**Solución:**

```bash
# Hacer backup primero
pg_dump $DATABASE_URL > backup.sql

# Resetear migraciones
npx prisma migrate reset

# Restaurar datos si es necesario
```

### Error: "Connection refused"

**Causa:** No puede conectar a la base de datos

**Solución:**

```bash
# Verificar DATABASE_URL en .env
echo $DATABASE_URL

# Probar conexión
psql $DATABASE_URL -c "SELECT 1"
```

### Error: "Schema is not in sync"

**Causa:** Schema y base de datos desincronizados

**Solución:**

```bash
# Forzar sincronización
npx prisma db push --force-reset

# ⚠️ Esto borra datos, hacer backup primero
```

## 📝 Script Rápido

Crear archivo: `arreglar-phone-field.bat`

```batch
@echo off
echo 🔧 Arreglando campo phone en base de datos...
echo.

echo 1. Sincronizando schema con base de datos...
call npx prisma db push

echo.
echo 2. Regenerando cliente de Prisma...
call npx prisma generate

echo.
echo ✅ Listo! Reinicia el servidor.
echo.
pause
```

Ejecutar:

```bash
arreglar-phone-field.bat
```

## 🎯 Resumen

```bash
# Solución rápida (1 comando)
npx prisma db push && npx prisma generate

# Luego reiniciar servidor
npm run dev
```

**¡Listo! El campo phone ahora existe en tu base de datos.** ✅

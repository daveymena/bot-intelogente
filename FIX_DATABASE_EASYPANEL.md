# 🔧 SOLUCIÓN: Error de Base de Datos en Easypanel

## ❌ Error Actual
```
Invalid `prisma.user.findUnique()` invocation:
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
```

## 🎯 Causa
Tu `schema.prisma` está configurado para SQLite (desarrollo local) pero Easypanel usa PostgreSQL.

## ✅ SOLUCIÓN RÁPIDA

### Paso 1: Actualizar schema.prisma para PostgreSQL

Cambia en `prisma/schema.prisma` la línea 8:

**ANTES:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**DESPUÉS:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 2: Verificar Variables de Entorno en Easypanel

En tu panel de Easypanel, asegúrate de tener:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres:5432/botwhatsapp
NODE_ENV=production
```

**IMPORTANTE:** Reemplaza `TU_PASSWORD` con la contraseña real de tu base de datos PostgreSQL en Easypanel.

### Paso 3: Regenerar Prisma Client

Después de cambiar el provider, ejecuta localmente:

```bash
npm run db:generate
```

### Paso 4: Aplicar Migraciones en Producción

En Easypanel, después de hacer el deploy, ejecuta:

```bash
npx prisma migrate deploy
```

O si prefieres push directo (más rápido):

```bash
npx prisma db push
```

## 📋 Checklist Completo

- [ ] Cambiar `provider = "sqlite"` a `provider = "postgresql"` en schema.prisma
- [ ] Verificar DATABASE_URL en Easypanel (debe empezar con `postgresql://`)
- [ ] Regenerar Prisma Client: `npm run db:generate`
- [ ] Hacer commit y push a Git
- [ ] Redesplegar en Easypanel
- [ ] Ejecutar migraciones: `npx prisma db push`

## 🔍 Verificar que Funciona

Después del deploy, verifica en los logs de Easypanel que no haya errores de conexión a la base de datos.

## 💡 Tip: Desarrollo Local vs Producción

Para mantener SQLite en local y PostgreSQL en producción, puedes usar:

```prisma
datasource db {
  provider = "postgresql"  // Siempre PostgreSQL
  url      = env("DATABASE_URL")
}
```

Y en tu `.env` local:
```env
DATABASE_URL=file:./dev.db  # SQLite funciona con PostgreSQL provider
```

Pero es más limpio usar PostgreSQL en ambos ambientes.

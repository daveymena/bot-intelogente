# 🔧 Solución: Error de Base de Datos

## ❌ Error que estás viendo

```
Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`
```

## 🎯 Causa

El schema de Prisma está configurado para PostgreSQL pero tu `.env` tiene SQLite o no tiene `DATABASE_URL` configurada correctamente.

## ✅ Soluciones Rápidas

### Opción 1: Usar SQLite (Desarrollo - Más Fácil)

**Paso 1:** Verificar y arreglar configuración
```bash
npx tsx scripts/arreglar-database.ts
```

**Paso 2:** Cambiar el schema de Prisma

Abre `prisma/schema.prisma` y cambia:
```prisma
datasource db {
  provider = "postgresql"  // ← Cambiar esto
  url      = env("DATABASE_URL")
}
```

Por:
```prisma
datasource db {
  provider = "sqlite"  // ← A esto
  url      = env("DATABASE_URL")
}
```

**Paso 3:** Crear la base de datos
```bash
npm run db:push
```

**Paso 4:** Verificar que funcione
```bash
npx tsx scripts/verificar-database.ts
```

### Opción 2: Usar PostgreSQL (Producción)

**Paso 1:** Instalar PostgreSQL
- Windows: Descargar de https://www.postgresql.org/download/windows/
- O usar Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

**Paso 2:** Configurar DATABASE_URL en `.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/botwhatsapp"
```

**Paso 3:** Crear la base de datos
```bash
npm run db:push
```

**Paso 4:** Verificar que funcione
```bash
npx tsx scripts/verificar-database.ts
```

## 🚀 Comandos de Diagnóstico

### Verificar estado de la base de datos
```bash
npx tsx scripts/verificar-database.ts
```

### Arreglar configuración automáticamente
```bash
npx tsx scripts/arreglar-database.ts
```

### Menú interactivo
```bash
gestionar-usuarios-no-verificados.bat
```
Selecciona opción "1" para verificar la base de datos.

## 📋 Checklist de Verificación

- [ ] Archivo `.env` existe
- [ ] `DATABASE_URL` está configurada en `.env`
- [ ] `DATABASE_URL` no está comentada (sin `#` al inicio)
- [ ] El provider en `schema.prisma` coincide con la URL
  - SQLite: `provider = "sqlite"` + `DATABASE_URL="file:./dev.db"`
  - PostgreSQL: `provider = "postgresql"` + `DATABASE_URL="postgresql://..."`
- [ ] Se ejecutó `npm run db:push`
- [ ] La base de datos tiene las tablas creadas

## 🔍 Verificar Configuración Actual

### Ver DATABASE_URL actual
```bash
# Windows CMD
echo %DATABASE_URL%

# Windows PowerShell
$env:DATABASE_URL

# O ver el archivo .env directamente
type .env | findstr DATABASE_URL
```

### Ver provider en schema.prisma
```bash
type prisma\schema.prisma | findstr provider
```

## 💡 Recomendación

**Para desarrollo local:** Usa SQLite (Opción 1)
- ✅ No requiere instalar nada
- ✅ Más rápido de configurar
- ✅ Archivo local simple

**Para producción:** Usa PostgreSQL (Opción 2)
- ✅ Más robusto
- ✅ Mejor rendimiento
- ✅ Más características

## 🆘 Si Nada Funciona

1. **Eliminar y recrear:**
```bash
# Eliminar base de datos actual
del prisma\dev.db

# Recrear
npm run db:push
```

2. **Reinstalar Prisma:**
```bash
npm install @prisma/client
npx prisma generate
npm run db:push
```

3. **Verificar de nuevo:**
```bash
npx tsx scripts/verificar-database.ts
```

## ✅ Después de Arreglar

Una vez que la base de datos funcione, podrás usar:

```bash
# Ver usuarios no verificados
npx tsx scripts/listar-usuarios-no-verificados.ts

# Activar usuario
npx tsx scripts/activar-usuario-manual.ts usuario@ejemplo.com

# Menú interactivo
gestionar-usuarios-no-verificados.bat
```

---

**¿Sigues con problemas?** Ejecuta:
```bash
npx tsx scripts/verificar-database.ts
```

Y comparte el resultado para ayudarte mejor.

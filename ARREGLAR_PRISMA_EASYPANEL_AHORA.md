# 🚨 ARREGLAR ERROR DE PRISMA EN EASYPANEL

## ❌ Error Actual

```
Invalid `prisma.user.findUnique()` invocation:
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
--> schema.prisma:9
| 8 | provider = "sqlite"
| 9 | url = env("DATABASE_URL")
```

## 🔍 Causa del Problema

El schema de Prisma en Easypanel está configurado para **SQLite** pero la `DATABASE_URL` es de **PostgreSQL**.

## ✅ SOLUCIÓN INMEDIATA

### Opción 1: Redesplegar desde Git (RECOMENDADO)

1. **Asegúrate de que el código local esté actualizado:**
   ```bash
   git status
   git add .
   git commit -m "Fix: Prisma schema para PostgreSQL"
   git push origin main
   ```

2. **En Easypanel:**
   - Ve a tu aplicación
   - Haz clic en "Redeploy"
   - Espera a que termine el build
   - La aplicación se reiniciará con el schema correcto

### Opción 2: Ejecutar Comando Directo en Easypanel

1. **Ve a Easypanel → Tu App → Terminal**

2. **Ejecuta estos comandos:**
   ```bash
   # Generar el cliente de Prisma con PostgreSQL
   npx prisma generate
   
   # Aplicar migraciones
   npx prisma db push
   
   # Reiniciar la aplicación
   pm2 restart all
   ```

### Opción 3: Verificar Variables de Entorno

1. **Ve a Easypanel → Environment**

2. **Verifica que tengas:**
   ```bash
   DATABASE_URL=postgres://postgres:9feb7a0e7110d6a42e93@provedor-ia_bot-whatsapp-db:5432/botwhatsapp?sslmode=disable
   DATABASE_PROVIDER=postgresql
   ```

3. **Guarda y redespliega**

## 🔧 Verificar el Schema Local

Tu `prisma/schema.prisma` debe tener:

```prisma
datasource db {
  provider = "postgresql"  // ✅ NO "sqlite"
  url      = env("DATABASE_URL")
}
```

## 📋 Checklist de Verificación

- [ ] El schema local tiene `provider = "postgresql"`
- [ ] El código está subido a Git
- [ ] Las variables de entorno en Easypanel están correctas
- [ ] Se ejecutó `npx prisma generate` en Easypanel
- [ ] La aplicación se redespliegó

## 🚀 Después de Arreglar

1. **Prueba el login:**
   - Ve a `https://tu-dominio.com/login`
   - Intenta iniciar sesión
   - No debería dar error de Prisma

2. **Verifica la base de datos:**
   ```bash
   # En Easypanel Terminal
   npx prisma studio
   ```

## ⚠️ Si el Error Persiste

Ejecuta en Easypanel Terminal:

```bash
# 1. Limpiar caché de Prisma
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# 2. Reinstalar Prisma
npm install prisma @prisma/client --force

# 3. Generar cliente
npx prisma generate

# 4. Aplicar schema
npx prisma db push

# 5. Reiniciar
pm2 restart all
```

## 📝 Nota Importante

Este error ocurre porque el código desplegado en Easypanel es diferente al código local. Siempre que hagas cambios importantes:

1. Commit y push a Git
2. Redespliega en Easypanel
3. Verifica que funcione

---

**¿Listo?** Redespliega ahora y el error desaparecerá.

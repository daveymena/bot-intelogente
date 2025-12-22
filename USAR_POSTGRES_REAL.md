# 🐘 USAR POSTGRESQL REAL (Recomendado)

## ✅ Por qué es mejor usar PostgreSQL desde el inicio:

1. **Mismo entorno**: Lo que funciona en local funciona en producción
2. **Sin cambios**: No necesitas ejecutar `npm run db:prod` antes de cada deploy
3. **Más robusto**: PostgreSQL es más potente que SQLite
4. **Características avanzadas**: JSON, búsqueda full-text, etc.
5. **Profesional**: Es lo que usan las empresas reales

## 🎯 OPCIÓN 1: PostgreSQL Local (Mejor para desarrollo)

### Instalar PostgreSQL en Windows:

1. **Descargar PostgreSQL:**
   https://www.postgresql.org/download/windows/
   
2. **Instalar con estos valores:**
   - Puerto: 5432
   - Usuario: postgres
   - Contraseña: (elige una fácil para desarrollo, ej: "postgres")
   
3. **Crear base de datos:**
   ```bash
   # Abrir pgAdmin o usar terminal
   createdb botwhatsapp
   ```

4. **Actualizar tu .env:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/botwhatsapp"
   ```

5. **Actualizar schema.prisma:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

6. **Aplicar cambios:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

✅ **LISTO!** Ahora tienes PostgreSQL local y nunca más necesitas cambiar entre SQLite y PostgreSQL.

---

## 🌐 OPCIÓN 2: Conectar a PostgreSQL de Easypanel

Si no quieres instalar PostgreSQL local, puedes conectarte directamente al de Easypanel:

### Paso 1: Obtener credenciales de Easypanel

En tu panel de Easypanel:
1. Ve a tu servicio PostgreSQL
2. Busca la información de conexión:
   - Host/IP
   - Puerto (usualmente 5432)
   - Usuario (usualmente "postgres")
   - Contraseña
   - Nombre de base de datos

### Paso 2: Configurar túnel SSH (si es necesario)

Si Easypanel no expone PostgreSQL públicamente, necesitas un túnel:

```bash
# Ejemplo (ajusta según tu configuración)
ssh -L 5432:localhost:5432 usuario@tu-servidor-easypanel.com
```

### Paso 3: Actualizar .env

```env
# Conexión directa (si está expuesto)
DATABASE_URL="postgresql://postgres:TU_PASSWORD@TU_DOMINIO_EASYPANEL:5432/botwhatsapp"

# O conexión local si usas túnel SSH
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/botwhatsapp"
```

### Paso 4: Actualizar schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 5: Aplicar cambios

```bash
npm run db:generate
```

⚠️ **CUIDADO:** Estarás trabajando directamente en producción. Cualquier cambio afecta tu sitio en vivo.

---

## 🚀 OPCIÓN 3: Docker PostgreSQL Local (Más fácil)

Si no quieres instalar PostgreSQL, usa Docker:

```bash
# Crear contenedor PostgreSQL
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=botwhatsapp -p 5432:5432 -d postgres:15

# Actualizar .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/botwhatsapp"

# Aplicar cambios
npm run db:generate
npm run db:push
```

Para detener/iniciar:
```bash
docker stop postgres-dev
docker start postgres-dev
```

---

## 📋 Checklist de Migración

- [ ] Elegir opción (Local, Easypanel, o Docker)
- [ ] Instalar/configurar PostgreSQL
- [ ] Actualizar DATABASE_URL en .env
- [ ] Cambiar provider a "postgresql" en schema.prisma
- [ ] Ejecutar: npm run db:generate
- [ ] Ejecutar: npm run db:push
- [ ] Verificar que funciona: npm run dev
- [ ] Importar productos si es necesario

---

## 🎯 Recomendación Final

**Para desarrollo profesional:**
→ Usa PostgreSQL local (Opción 1 o 3)

**Para pruebas rápidas:**
→ Mantén SQLite (lo que tienes ahora)

**Para trabajar en producción:**
→ Usa el Dashboard de Easypanel directamente

---

## 💡 ¿Necesitas ayuda?

Dime qué opción prefieres y te ayudo a configurarla paso a paso.

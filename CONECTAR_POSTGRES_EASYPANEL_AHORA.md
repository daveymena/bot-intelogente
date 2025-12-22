# 🔌 CONECTAR A POSTGRESQL DE EASYPANEL - GUÍA RÁPIDA

## 📋 Tu Configuración Actual

```
Usuario: postgres
Contraseña: 9feb7a0e7110d6a42e93
Base de datos: botwhatsapp
Puerto: 5432
Dominio Easypanel: sqaoeo.easypanel.host
```

---

## 🚀 PASO 1: Exponer PostgreSQL en Easypanel

Antes de conectarte, debes exponer el puerto de PostgreSQL:

### En Easypanel:

1. Ve a tu proyecto en: https://sqaoeo.easypanel.host
2. Busca el servicio **PostgreSQL** (probablemente "bot-whatsapp-db")
3. Ve a la pestaña **"Domains"** o **"Network"** o **"Expose"**
4. Habilita el acceso público al puerto **5432**

### Opciones posibles:

**Opción A: Agregar Dominio**
- Agrega un subdominio como: `db.sqaoeo.easypanel.host`
- Puerto: 5432

**Opción B: Exponer Puerto Directo**
- Habilita "Expose Port 5432"
- Te dará acceso en: `sqaoeo.easypanel.host:PUERTO_PUBLICO`

Una vez hecho esto, anota la **IP o dominio público** que te da Easypanel.

---

## 🚀 PASO 2: Probar la Conexión

### Método 1: Script TypeScript (Recomendado)

```bash
# Ejecutar el script de prueba
npx tsx scripts/test-postgres-connection.ts
```

El script ya está configurado con tus datos. Solo necesitas actualizar el host con el dominio/IP público que obtuviste en el Paso 1.

### Método 2: Comando psql Directo

Si tienes PostgreSQL instalado:

```bash
psql -h db.sqaoeo.easypanel.host -p 5432 -U postgres -d botwhatsapp
```

Cuando te pida la contraseña: `9feb7a0e7110d6a42e93`

### Método 3: Con Docker (Sin instalar PostgreSQL)

```bash
docker run -it --rm postgres:15 psql -h db.sqaoeo.easypanel.host -p 5432 -U postgres -d botwhatsapp
```

---

## 🚀 PASO 3: Actualizar .env Local

Una vez que confirmes que la conexión funciona, actualiza tu `.env`:

```env
# Cambiar de SQLite a PostgreSQL
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@db.sqaoeo.easypanel.host:5432/botwhatsapp"
```

Luego ejecuta:

```bash
# Aplicar el schema a la base de datos
npm run db:push

# O si prefieres usar migraciones
npm run db:migrate
```

---

## ❌ Si No Puedes Exponer PostgreSQL

### Alternativa 1: Túnel SSH

Si Easypanel te da acceso SSH:

```bash
# Terminal 1: Crear túnel (mantener abierto)
ssh -L 5432:provedor-ia_bot-whatsapp-db:5432 usuario@sqaoeo.easypanel.host

# Terminal 2: Conectar
psql -h localhost -p 5432 -U postgres -d botwhatsapp
```

### Alternativa 2: PostgreSQL Local (Más Simple)

Para desarrollo, usa PostgreSQL local:

```bash
# Iniciar PostgreSQL con Docker
docker run --name postgres-dev ^
  -e POSTGRES_PASSWORD=9feb7a0e7110d6a42e93 ^
  -e POSTGRES_DB=botwhatsapp ^
  -p 5432:5432 ^
  -d postgres:15

# Actualizar .env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@localhost:5432/botwhatsapp"

# Aplicar schema
npm run db:push

# Crear usuario admin
npx tsx scripts/create-admin.ts
```

**Ventajas:**
- ✅ Más rápido (local)
- ✅ No afectas producción
- ✅ Funciona offline
- ✅ Fácil de resetear

---

## 🔍 Verificar Conexión

Una vez conectado, prueba estos comandos SQL:

```sql
-- Listar tablas
\dt

-- Ver usuarios
SELECT id, email, name FROM "User";

-- Ver productos
SELECT id, name, price FROM "Product" LIMIT 10;

-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM "User") as usuarios,
  (SELECT COUNT(*) FROM "Product") as productos,
  (SELECT COUNT(*) FROM "Conversation") as conversaciones;

-- Salir
\q
```

---

## 📞 Comandos Rápidos

```bash
# Probar conexión con script
npx tsx scripts/test-postgres-connection.ts

# Conectar con psql
psql -h db.sqaoeo.easypanel.host -p 5432 -U postgres -d botwhatsapp

# Aplicar schema
npm run db:push

# Ver tablas
npm run db:studio

# Crear admin
npx tsx scripts/create-admin.ts
```

---

## 💡 Recomendación

Para desarrollo local, te recomiendo usar **PostgreSQL local con Docker** (Alternativa 2). Es más simple, rápido y seguro. Usa la base de datos de Easypanel solo para producción.

---

## ❓ Problemas Comunes

### Error: "Connection refused"
- PostgreSQL no está expuesto públicamente
- Verifica en Easypanel → Servicio PostgreSQL → Domains/Expose

### Error: "Timeout"
- IP/dominio incorrecto
- Firewall bloqueando el puerto
- Verifica con: `telnet db.sqaoeo.easypanel.host 5432`

### Error: "Authentication failed"
- Contraseña incorrecta
- Verifica la contraseña en Easypanel

### Error: "Database does not exist"
- Nombre de base de datos incorrecto
- Puede ser `postgres` en lugar de `botwhatsapp`

---

## 🎯 Siguiente Paso

Una vez que tengas la conexión funcionando:

1. ✅ Actualiza `.env` con la URL correcta
2. ✅ Ejecuta `npm run db:push`
3. ✅ Crea el usuario admin: `npx tsx scripts/create-admin.ts`
4. ✅ Importa productos: `npx tsx scripts/import-productos-completos.ts`

¡Listo para desarrollar! 🚀

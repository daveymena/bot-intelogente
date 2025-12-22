# 🔌 PROBAR CONEXIÓN A POSTGRESQL DE EASYPANEL

## 📋 Información Actual

Tu base de datos PostgreSQL en Easypanel:
- **Usuario**: `postgres`
- **Contraseña**: `9feb7a0e7110d6a42e93`
- **Base de datos**: `botwhatsapp`
- **Puerto**: `5432`
- **Host interno**: `provedor-ia_bot-whatsapp-db` (solo funciona dentro de Docker)

## 🎯 Objetivo

Conectarte desde tu computadora local a la base de datos en Easypanel para hacer pruebas.

---

## 🚀 OPCIÓN 1: Script de Prueba (Recomendado)

### Paso 1: Obtener IP/Dominio Público

Primero necesitas exponer PostgreSQL en Easypanel:

1. Ve a **Easypanel** → Tu proyecto
2. Busca el servicio **PostgreSQL** (bot-whatsapp-db)
3. Ve a **"Domains"** o **"Expose"** o **"Network"**
4. Habilita acceso público al puerto **5432**
5. Anota la **IP pública** o **dominio** que te da

Ejemplos de lo que podrías obtener:
- `db.tu-dominio.com`
- `123.45.67.89`
- `tu-servidor.easypanel.host`

### Paso 2: Configurar el Script

Edita el archivo `scripts/test-postgres-connection.ts`:

```typescript
const DB_CONFIG = {
  connectionString: 'postgresql://postgres:9feb7a0e7110d6a42e93@TU_IP_AQUI:5432/botwhatsapp',
  ssl: false, // Cambia a true si Easypanel requiere SSL
};
```

Reemplaza `TU_IP_AQUI` con la IP o dominio que obtuviste.

### Paso 3: Ejecutar

```bash
npx tsx scripts/test-postgres-connection.ts
```

El script te mostrará:
- ✅ Si la conexión funciona
- 📊 Tablas existentes
- 📈 Cantidad de registros
- ❌ Errores detallados si algo falla

---

## 🚀 OPCIÓN 2: Usar psql (Línea de Comandos)

Si tienes PostgreSQL instalado localmente:

### Método A: Comando directo

```bash
psql -h TU_IP_O_DOMINIO -p 5432 -U postgres -d botwhatsapp
```

Cuando te pida la contraseña, ingresa: `9feb7a0e7110d6a42e93`

### Método B: Usar el script .bat

1. Edita `scripts/test-postgres-psql.bat`
2. Reemplaza `TU_IP_O_DOMINIO` con tu IP/dominio
3. Ejecuta: `scripts\test-postgres-psql.bat`

### Comandos útiles en psql:

```sql
-- Listar tablas
\dt

-- Ver estructura de una tabla
\d "User"

-- Contar usuarios
SELECT COUNT(*) FROM "User";

-- Ver productos
SELECT id, name, price FROM "Product" LIMIT 10;

-- Salir
\q
```

---

## 🚀 OPCIÓN 3: Usar Docker (Sin instalar PostgreSQL)

Si tienes Docker instalado:

```bash
docker run -it --rm postgres:15 psql -h TU_IP_O_DOMINIO -p 5432 -U postgres -d botwhatsapp
```

Ingresa la contraseña cuando te la pida: `9feb7a0e7110d6a42e93`

---

## 🚀 OPCIÓN 4: Túnel SSH (Si tienes acceso SSH)

Si Easypanel te da acceso SSH al servidor:

### Paso 1: Crear túnel

```bash
ssh -L 5432:provedor-ia_bot-whatsapp-db:5432 usuario@tu-servidor-easypanel.com
```

Mantén esta terminal abierta.

### Paso 2: En otra terminal, conectar

```bash
psql -h localhost -p 5432 -U postgres -d botwhatsapp
```

O actualiza tu `.env`:

```env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@localhost:5432/botwhatsapp"
```

---

## 🚀 OPCIÓN 5: PostgreSQL Local (Más Simple)

En lugar de conectarte a Easypanel, usa PostgreSQL local para desarrollo:

### Con Docker (Recomendado):

```bash
# Iniciar PostgreSQL
docker run --name postgres-dev ^
  -e POSTGRES_PASSWORD=9feb7a0e7110d6a42e93 ^
  -e POSTGRES_DB=botwhatsapp ^
  -p 5432:5432 ^
  -d postgres:15

# Actualizar .env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@localhost:5432/botwhatsapp"

# Aplicar migraciones
npm run db:push
```

### Ventajas:
- ✅ Más rápido (local)
- ✅ No afectas producción
- ✅ Funciona offline
- ✅ Fácil de resetear

---

## ❌ Solución de Problemas

### Error: "Connection refused"

**Causa**: PostgreSQL no está expuesto públicamente

**Solución**:
1. Ve a Easypanel
2. Expone el puerto 5432 del servicio PostgreSQL
3. O usa túnel SSH
4. O usa PostgreSQL local

### Error: "Timeout"

**Causa**: Firewall bloqueando el puerto o IP incorrecta

**Solución**:
1. Verifica que la IP/dominio sea correcta
2. Verifica que el puerto 5432 esté abierto en el firewall
3. Prueba con `telnet TU_IP 5432` para verificar conectividad

### Error: "Authentication failed"

**Causa**: Contraseña incorrecta

**Solución**:
1. Verifica la contraseña en Easypanel
2. Asegúrate de no tener espacios extra

### Error: "Database does not exist"

**Causa**: El nombre de la base de datos es incorrecto

**Solución**:
1. Verifica el nombre en Easypanel
2. Puede ser `botwhatsapp`, `postgres`, u otro nombre

---

## 🎯 Recomendación

Para desarrollo local, te recomiendo **OPCIÓN 5** (PostgreSQL local con Docker):

```bash
# 1. Iniciar PostgreSQL local
docker run --name postgres-dev -e POSTGRES_PASSWORD=9feb7a0e7110d6a42e93 -e POSTGRES_DB=botwhatsapp -p 5432:5432 -d postgres:15

# 2. Actualizar .env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@localhost:5432/botwhatsapp"

# 3. Aplicar schema
npm run db:push

# 4. Crear admin
npx tsx scripts/create-admin.ts
```

Es más simple, rápido y seguro para desarrollo. Usa Easypanel solo para producción.

---

## 📞 ¿Necesitas Ayuda?

Dime:
1. ¿Qué opción prefieres?
2. ¿Tienes acceso SSH a Easypanel?
3. ¿Prefieres usar PostgreSQL local?

Y te ayudo a configurarlo paso a paso.

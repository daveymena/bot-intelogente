# 🔌 Exponer PostgreSQL en Easypanel

## 📋 Pasos para Exponer el Puerto

### 1. Ir a tu Servicio PostgreSQL en Easypanel

1. Abre Easypanel
2. Ve a tu proyecto
3. Busca el servicio **PostgreSQL** (davey_postgres-db)
4. Click en el servicio

### 2. Configurar Puerto Público

En la configuración del servicio PostgreSQL:

1. Busca la sección **"Network"** o **"Ports"**
2. Busca la opción **"Expose Port"** o **"Public Port"**
3. Configura:
   ```
   Internal Port: 5432
   External Port: 5432 (o cualquier puerto disponible)
   Protocol: TCP
   ```

### 3. Obtener la URL Externa

Después de exponer el puerto, Easypanel te dará una URL como:

```
Host: tu-servidor.easypanel.host
Puerto: 5432 (o el puerto que asignó)
```

O puede ser una IP:
```
Host: 123.456.789.0
Puerto: 5432
```

## 🔧 Actualizar tu .env Local

Una vez que tengas la URL externa, actualiza tu `.env`:

```env
# Para desarrollo local (conectar a Easypanel)
DATABASE_URL=postgresql://postgres:6715320D@TU-HOST-EXTERNO:5432/davey?sslmode=disable

# Ejemplo con dominio:
# DATABASE_URL=postgresql://postgres:6715320D@davey-db.easypanel.host:5432/davey?sslmode=disable

# Ejemplo con IP:
# DATABASE_URL=postgresql://postgres:6715320D@123.456.789.0:5432/davey?sslmode=disable
```

## ⚠️ Importante: Seguridad

### Opción 1: Exponer Temporalmente (Recomendado)
- Expone el puerto solo cuando necesites migrar datos
- Cierra el puerto después de terminar
- Más seguro

### Opción 2: Exponer Permanentemente
- Útil para desarrollo continuo
- Asegúrate de:
  - Usar contraseña fuerte ✅ (ya la tienes: 6715320D)
  - Configurar firewall si es posible
  - Limitar IPs permitidas (si Easypanel lo permite)

## 🎯 Alternativa: Usar SQLite en Local

Si no quieres exponer PostgreSQL, puedes:

### Desarrollo Local: SQLite
```env
DATABASE_URL=file:./dev.db
```

### Producción Easypanel: PostgreSQL
```env
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

**Ventajas**:
- ✅ Desarrollo rápido sin configuración
- ✅ No necesitas exponer puertos
- ✅ Más seguro
- ✅ Mismo código funciona en ambos

## 📝 Configuración Recomendada

### Para tu caso (desarrollo + producción):

**Archivo `.env` (local)**:
```env
# Desarrollo local con SQLite
DATABASE_URL=file:./dev.db
```

**Variables en Easypanel**:
```env
# Producción con PostgreSQL
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

## 🚀 Comandos Después de Exponer

Una vez que expongas PostgreSQL y actualices la URL:

```bash
# 1. Actualizar schema de Prisma a PostgreSQL
# Editar prisma/schema.prisma:
# provider = "postgresql"

# 2. Generar cliente
npx prisma generate

# 3. Aplicar schema
npx prisma db push

# 4. Migrar datos (si tienes en SQLite)
npx tsx migrar-productos-postgres.ts

# 5. Verificar
npx prisma studio
```

## 🔍 Verificar Conexión

Después de exponer, prueba la conexión:

```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName TU-HOST-EXTERNO -Port 5432

# O con psql (si lo tienes instalado)
psql -h TU-HOST-EXTERNO -p 5432 -U postgres -d davey
```

## 💡 Resumen

### Si quieres conectarte desde local a PostgreSQL:
1. **Exponer puerto 5432** en Easypanel
2. **Obtener URL externa**
3. **Actualizar DATABASE_URL** en tu `.env` local
4. **Cambiar provider a "postgresql"** en schema.prisma
5. **Ejecutar** `npx prisma db push`

### Si prefieres simplicidad (Recomendado):
1. **Usar SQLite en local** (ya configurado)
2. **Usar PostgreSQL en Easypanel** (configurar en variables de entorno)
3. **No exponer puertos** (más seguro)
4. **Mismo código funciona en ambos** ✅

---

**Recomendación**: Usa SQLite en local y PostgreSQL en producción. Es más simple y seguro.

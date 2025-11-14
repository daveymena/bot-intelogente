# 🔓 EXPONER POSTGRESQL EN EASYPANEL

## ❌ Problema Actual

Tu URL de conexión usa un host interno de Docker:
```
postgres://postgres:9feb7a0e7110d6a42e93@provedor-ia_bot-whatsapp-db:5432/botwhatsapp
```

El host `provedor-ia_bot-whatsapp-db` solo funciona dentro de la red Docker de Easypanel.

## ✅ SOLUCIÓN: Exponer PostgreSQL

### Paso 1: En Easypanel

1. Ve a tu proyecto en Easypanel
2. Busca el servicio **PostgreSQL** (probablemente llamado "bot-whatsapp-db" o similar)
3. Ve a la sección **"Domains"** o **"Expose"** o **"Ports"**
4. Habilita el acceso público al puerto 5432

### Opciones según tu versión de Easypanel:

#### Opción A: Agregar Dominio
- Agrega un dominio/subdominio para PostgreSQL
- Ejemplo: `db.tu-dominio.com:5432`

#### Opción B: Exponer Puerto
- Habilita "Expose Port 5432"
- Te dará una IP pública o dominio

#### Opción C: NodePort (si está disponible)
- Configura un NodePort para el puerto 5432
- Te dará acceso en: `IP_SERVIDOR:PUERTO_PUBLICO`

### Paso 2: Obtener Nueva URL

Una vez expuesto, deberías obtener algo como:

```
# Con dominio
postgres://postgres:9feb7a0e7110d6a42e93@db.tu-dominio.com:5432/botwhatsapp

# Con IP pública
postgres://postgres:9feb7a0e7110d6a42e93@123.45.67.89:5432/botwhatsapp

# Con puerto mapeado
postgres://postgres:9feb7a0e7110d6a42e93@tu-servidor.com:30432/botwhatsapp
```

### Paso 3: Configurar en Local

Una vez tengas la URL pública, yo la configuraré en tu `.env` local.

---

## 🔒 ALTERNATIVA: Túnel SSH

Si Easypanel te da acceso SSH al servidor:

```bash
# Crear túnel SSH (mantener abierto)
ssh -L 5432:provedor-ia_bot-whatsapp-db:5432 usuario@tu-servidor-easypanel.com

# En otra terminal, usar:
DATABASE_URL="postgres://postgres:9feb7a0e7110d6a42e93@localhost:5432/botwhatsapp"
```

---

## 💡 ALTERNATIVA MÁS SIMPLE: PostgreSQL Local

En lugar de conectarte a Easypanel, instala PostgreSQL localmente:

### Con Docker (Más fácil):
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=9feb7a0e7110d6a42e93 -e POSTGRES_DB=botwhatsapp -p 5432:5432 -d postgres:15
```

### Ventajas:
- ✅ Más rápido (local)
- ✅ No afectas producción
- ✅ Funciona offline
- ✅ Mismo entorno que producción

---

## 🎯 ¿Qué prefieres?

1. **Exponer PostgreSQL en Easypanel** (necesitas acceso al panel)
2. **Usar túnel SSH** (necesitas credenciales SSH)
3. **Instalar PostgreSQL local con Docker** (más simple y seguro)

Dime cuál prefieres y te ayudo a configurarlo.

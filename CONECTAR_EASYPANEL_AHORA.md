# 🔌 CONECTAR A POSTGRESQL DE EASYPANEL - PASO A PASO

## 📋 Paso 1: Obtener Credenciales de Easypanel

Ve a tu panel de Easypanel y busca la información de tu base de datos PostgreSQL:

### Opción A: Desde el servicio PostgreSQL
1. Abre Easypanel
2. Ve a tu proyecto
3. Busca el servicio "PostgreSQL" o "Database"
4. Busca la sección "Connection" o "Credentials"

### Opción B: Desde las variables de entorno
1. Abre tu aplicación en Easypanel
2. Ve a "Environment Variables"
3. Busca la variable `DATABASE_URL`

## 📝 Información que necesitas:

Deberías ver algo como esto:

```
Host: postgres (o una IP/dominio)
Port: 5432
User: postgres
Password: [tu contraseña]
Database: botwhatsapp
```

O una URL completa:
```
postgresql://postgres:PASSWORD@HOST:5432/botwhatsapp
```

## ⚠️ IMPORTANTE: Exponer PostgreSQL

Por defecto, Easypanel NO expone PostgreSQL públicamente (por seguridad).

### Para conectarte desde tu máquina local, tienes 2 opciones:

### OPCIÓN 1: Exponer PostgreSQL (Más fácil pero menos seguro)

En Easypanel:
1. Ve a tu servicio PostgreSQL
2. Busca "Domains" o "Expose"
3. Agrega un dominio o habilita acceso público
4. Anota el host/dominio público

### OPCIÓN 2: Usar Túnel SSH (Más seguro - Recomendado)

Si Easypanel te da acceso SSH:

```bash
# Crear túnel SSH
ssh -L 5432:postgres:5432 usuario@tu-servidor-easypanel.com

# Dejar esta terminal abierta
# En otra terminal, conectarte a localhost:5432
```

## 🎯 Una vez tengas las credenciales:

Dime:
1. ¿Cuál es el HOST? (IP, dominio, o "localhost" si usas túnel)
2. ¿Cuál es el PASSWORD?
3. ¿Cuál es el nombre de la DATABASE? (probablemente "botwhatsapp")

Y yo configuraré todo automáticamente.

---

## 💡 Alternativa Rápida: Usar la misma URL que en producción

Si en Easypanel tu app ya funciona, puedes copiar la misma DATABASE_URL que usas allá:

1. Ve a Environment Variables en Easypanel
2. Copia el valor de DATABASE_URL
3. Pégalo aquí

Pero recuerda: **Estarás trabajando directo en producción** ⚠️

---

## 🔒 Seguridad

**NO compartas públicamente:**
- ❌ Tu contraseña de PostgreSQL
- ❌ La URL completa de conexión
- ❌ IPs o dominios internos

Solo compártelos conmigo en este chat privado.

# Configurar PostgreSQL para Producción

## Situación Actual

Has proporcionado estas credenciales:
- **Usuario**: postgres
- **Contraseña**: 6715320D
- **Base de datos**: davey
- **URL interna**: `davey_postgres-db:5432` (solo funciona dentro de Docker)

## Problema

La URL `davey_postgres-db` es un nombre de contenedor Docker interno que no es accesible desde tu máquina local.

## Solución

### Opción 1: Obtener la URL Externa de Easypanel

1. Ve a tu panel de Easypanel
2. Busca el servicio de PostgreSQL
3. En la sección de "Network" o "Domains", busca la URL externa o IP pública
4. La URL debería verse como:
   - `postgres://postgres:6715320D@tu-servidor.easypanel.host:5432/davey`
   - O con una IP: `postgres://postgres:6715320D@123.456.789.0:5432/davey`

### Opción 2: Usar para Deploy en Easypanel

Si solo necesitas esto para el deploy en Easypanel (no para desarrollo local), usa la URL interna:

```env
# Para Easypanel (dentro de Docker)
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

### Opción 3: Exponer PostgreSQL en Easypanel

1. En Easypanel, ve a tu servicio PostgreSQL
2. Busca la opción "Expose Port" o "Public Port"
3. Expone el puerto 5432
4. Easypanel te dará una URL externa

## Configuración Actual

He actualizado tu `.env` con:

```env
DATABASE_URL=postgresql://postgres:6715320D@localhost:5432/davey?sslmode=disable
```

**Necesitas reemplazar `localhost` con la URL externa real de tu servidor PostgreSQL.**

## Pasos para Actualizar

1. **Obtén la URL externa** de tu PostgreSQL en Easypanel
2. **Actualiza el `.env`**:
   ```bash
   DATABASE_URL=postgresql://postgres:6715320D@TU-HOST-EXTERNO:5432/davey?sslmode=disable
   ```
3. **Genera el cliente Prisma**:
   ```bash
   npx prisma generate
   ```
4. **Aplica el schema**:
   ```bash
   npx prisma db push
   ```
5. **Verifica la conexión**:
   ```bash
   npx prisma db pull
   ```

## Para Subir a Git

Una vez que tengas la base de datos configurada correctamente:

```bash
# 1. Asegúrate de que .env NO esté en Git (ya está en .gitignore)
# 2. Crea un archivo .env.example con las variables sin valores sensibles
# 3. Sube los cambios del schema
git add prisma/schema.prisma
git add .env.example
git commit -m "Actualizar schema a PostgreSQL para producción"
git push origin main
```

## Variables de Entorno para Easypanel

En Easypanel, configura estas variables:

```
DATABASE_URL=postgresql://postgres:6715320D@davey_postgres-db:5432/davey?sslmode=disable
```

(Usa la URL interna `davey_postgres-db` en Easypanel, ya que está en la misma red Docker)

## Notas Importantes

- ✅ El schema ya está actualizado a PostgreSQL
- ✅ El cliente Prisma está generado
- ⚠️ Necesitas la URL externa para conectarte desde tu máquina local
- ⚠️ Para Easypanel, usa la URL interna (`davey_postgres-db`)

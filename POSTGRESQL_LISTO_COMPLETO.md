# ✅ POSTGRESQL EASYPANEL - CONFIGURACIÓN COMPLETA

## 🎉 TODO FUNCIONANDO

Tu base de datos PostgreSQL de Easypanel está completamente configurada y sincronizada.

---

## 📋 Configuración Final

### Conexión
```
Host: 157.173.97.41
Puerto: 5432
Usuario: postgres
Contraseña: 9feb7a0e7110d6a42e93
Base de datos: botwhatsapp
PostgreSQL: v17.6
```

### .env Actualizado
```env
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@157.173.97.41:5432/botwhatsapp"
```

### prisma/schema.prisma Actualizado
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## ✅ Pasos Completados

1. ✅ Instalado `pg` y `@types/pg`
2. ✅ Probado conexión exitosa (script de prueba)
3. ✅ Actualizado `schema.prisma` de SQLite a PostgreSQL
4. ✅ Generado Prisma Client para PostgreSQL
5. ✅ Sincronizado schema con `db:push`

---

## 🚀 Próximos Pasos

### 1. Crear Usuario Admin

```bash
npx tsx scripts/create-admin.ts
```

Esto creará tu usuario administrador en la base de datos de producción.

### 2. Ver Productos Existentes

```bash
# Crear script rápido para ver productos
npx tsx -e "import {PrismaClient} from '@prisma/client'; const p = new PrismaClient(); p.product.findMany().then(r => console.log('Productos:', r.length)); p.$disconnect()"
```

### 3. Importar Productos (si es necesario)

```bash
npx tsx scripts/import-productos-completos.ts
```

### 4. Iniciar Aplicación

```bash
npm run dev
```

Tu aplicación ahora usará PostgreSQL de Easypanel en lugar de SQLite local.

---

## 🔍 Comandos Útiles

### Ver Datos en la Base de Datos

```bash
# Conectar con psql
psql -h 157.173.97.41 -p 5432 -U postgres -d botwhatsapp

# Dentro de psql:
\dt                                    # Listar tablas
SELECT * FROM "User";                  # Ver usuarios
SELECT * FROM "Product" LIMIT 10;      # Ver productos
SELECT COUNT(*) FROM conversations;    # Contar conversaciones
\q                                     # Salir
```

### Gestión de Schema

```bash
# Aplicar cambios del schema
npm run db:push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar Prisma Client
npx prisma generate
```

### Scripts de Datos

```bash
# Ver productos
npx tsx scripts/ver-productos.ts

# Crear admin
npx tsx scripts/create-admin.ts

# Importar productos
npx tsx scripts/import-productos-completos.ts

# Limpiar duplicados
npx tsx scripts/limpiar-productos-duplicados.ts
```

---

## 📊 Estado de las Tablas

Tu base de datos tiene **15 tablas**:

1. **User** - Usuarios del sistema
2. **Product** - Productos del catálogo
3. **Conversation** - Conversaciones de WhatsApp
4. **Message** - Mensajes individuales
5. **PaymentIntegration** - Integraciones de pago
6. **ai_prompts** - Prompts de IA
7. **bot_settings** - Configuración del bot
8. **message_queue** - Cola de mensajes
9. **payment_configs** - Configuración de pagos
10. **payments** - Pagos realizados
11. **sessions** - Sesiones de WhatsApp
12. **subscription_plans** - Planes de suscripción
13. **subscriptions** - Suscripciones activas
14. **usage_metrics** - Métricas de uso
15. **whatsapp_connections** - Conexiones de WhatsApp

---

## 🔄 Diferencias SQLite vs PostgreSQL

### Nombres de Tablas

**Prisma Schema (PascalCase):**
```prisma
model User { }
model Product { }
```

**PostgreSQL (minúsculas):**
```sql
users
products
```

Prisma maneja la conversión automáticamente. No necesitas cambiar nada en tu código.

### Tipos de Datos

PostgreSQL tiene tipos más específicos que SQLite:
- `String` → `TEXT` o `VARCHAR`
- `Int` → `INTEGER`
- `DateTime` → `TIMESTAMP`
- `Boolean` → `BOOLEAN`
- `Json` → `JSONB`

---

## 🌐 Conexiones

### Desarrollo Local (tu computadora)
```env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@157.173.97.41:5432/botwhatsapp"
```

### Producción (dentro de Easypanel)
```env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@provedor-ia_bot-whatsapp-db:5432/botwhatsapp"
```

---

## 💡 Recomendaciones

### Para Desarrollo

Considera usar PostgreSQL local para no afectar producción:

```bash
# Con Docker
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=9feb7a0e7110d6a42e93 \
  -e POSTGRES_DB=botwhatsapp \
  -p 5432:5432 \
  -d postgres:15

# Actualizar .env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@localhost:5432/botwhatsapp"

# Aplicar schema
npm run db:push
```

### Para Producción

En Easypanel, usa la URL interna:

```env
DATABASE_URL="postgresql://postgres:9feb7a0e7110d6a42e93@provedor-ia_bot-whatsapp-db:5432/botwhatsapp"
```

---

## 🔒 Seguridad

### Recomendaciones

1. **No expongas PostgreSQL públicamente en producción**
   - Solo para desarrollo/pruebas
   - En producción, usa la URL interna

2. **Cambia la contraseña**
   - La contraseña actual está en texto plano
   - Considera cambiarla en Easypanel

3. **Usa variables de entorno**
   - Nunca subas `.env` a Git
   - Usa `.env.example` para documentar

4. **Backups regulares**
   - Configura backups automáticos en Easypanel
   - Exporta datos importantes regularmente

---

## ❓ Solución de Problemas

### Error: "Connection refused"
```bash
# Verifica que PostgreSQL esté expuesto
# Ve a Easypanel → PostgreSQL → Domains/Expose
```

### Error: "Authentication failed"
```bash
# Verifica la contraseña en Easypanel
# Actualiza DATABASE_URL en .env
```

### Error: "Table does not exist"
```bash
# Sincroniza el schema
npm run db:push
```

### Error: "Prisma Client not generated"
```bash
# Regenera el cliente
npx prisma generate
```

---

## 📞 Archivos de Ayuda

- **POSTGRES_CONECTADO_EXITOSO.md** - Guía completa
- **PROBAR_POSTGRES_EASYPANEL.md** - Cómo probar la conexión
- **CONECTAR_POSTGRES_EASYPANEL_AHORA.md** - Guía paso a paso
- **.env.postgres-easypanel** - Configuración lista para copiar

---

## ✅ Resumen

Tu sistema ahora está usando PostgreSQL de Easypanel:

1. ✅ Conexión probada y funcionando
2. ✅ Schema sincronizado
3. ✅ Prisma Client generado
4. ✅ Listo para crear usuarios y productos
5. ✅ Listo para desarrollo y producción

¡Todo configurado correctamente! 🎉

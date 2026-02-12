# 🔧 Configuración de Base de Datos EasyPanel

## 📊 Credenciales Actualizadas

He actualizado el archivo `.env` con las credenciales correctas de tu PostgreSQL en EasyPanel:

```env
DB_HOST=164.68.122.5
DB_PORT=6432
DB_USER=postgres
DB_PASSWORD=67I5320D
DB_NAME=whatsappdb
```

## ⚠️ Problema de Conexión Local

La conexión desde tu computadora local a la base de datos de EasyPanel está **bloqueada por firewall** (esto es normal y esperado por seguridad).

## ✅ Soluciones

### Opción 1: Desplegar en EasyPanel (RECOMENDADO) 🚀

Esta es la mejor opción porque el bot se conectará a la BD desde la **red interna** de EasyPanel.

#### Pasos:

1. **Actualizar el archivo `.env` para producción**:

Crea un archivo `.env.production` con la URL de conexión interna:

```env
NODE_ENV=production
PORT=3000

# PostgreSQL EasyPanel (Red Interna)
DB_HOST=ollama_postgres-whatsapp
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=67I5320D
DB_NAME=whatsappdb

AI_PROVIDER=groq
GROQ_API_KEY=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
OPENCLAW_API_KEY=xxxxx

TENANT_MODE=true
LOG_LEVEL=info
```

**Nota**: El `DB_HOST` cambia a `ollama_postgres-whatsapp` (nombre interno del servicio en EasyPanel).

2. **Subir a GitHub**:

```bash
git add .
git commit -m "feat: bot multi-agente configurado para EasyPanel"
git push origin main
```

3. **Desplegar en EasyPanel**:
   - Crear nueva aplicación desde GitHub
   - Seleccionar tu repositorio
   - Configurar variables de entorno (copiar de `.env.production`)
   - Deploy

### Opción 2: Usar la URL de Conexión Interna desde Docker

Si ya tienes Docker en EasyPanel, usa la URL de conexión interna que aparece en tu panel:

```
postgres://postgres:67I5320D@ollama_postgres-whatsapp:5432/whatsappdb?sslmode=disable
```

### Opción 3: Aplicar Esquema Manualmente

Si tienes acceso a la consola de EasyPanel o a un cliente SQL:

1. **Conecta usando la URL interna** (desde otro servicio en EasyPanel)
2. **Ejecuta el esquema**:

```bash
# Desde un contenedor en EasyPanel
psql "postgres://postgres:67I5320D@ollama_postgres-whatsapp:5432/whatsappdb?sslmode=disable" -f src/database/init-schema.sql
```

### Opción 4: Usar Base de Datos Local Temporal

Para desarrollo local:

```bash
# 1. Iniciar PostgreSQL local con Docker
docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=whatsappdb \
  -p 5432:5432 \
  postgres:15

# 2. Actualizar .env temporalmente
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=123456

# 3. Aplicar esquema
psql -h localhost -U postgres -d whatsappdb -f src/database/init-schema.sql

# 4. Probar conexión
node scripts/test-db-connection.js

# 5. Iniciar bot
npm run bot:dev
```

## 🎯 Recomendación

**Te recomiendo la Opción 1**: Desplegar directamente en EasyPanel. Así:

✅ La conexión a la BD funcionará automáticamente
✅ No necesitas configurar firewall
✅ El bot estará en producción inmediatamente
✅ Podrás probar con WhatsApp real

## 📋 Checklist para Despliegue en EasyPanel

- [x] Credenciales de BD actualizadas en `.env`
- [x] Clave API de Groq configurada
- [ ] Crear `.env.production` con host interno
- [ ] Subir código a GitHub
- [ ] Crear aplicación en EasyPanel
- [ ] Configurar variables de entorno
- [ ] Desplegar
- [ ] Aplicar esquema SQL
- [ ] Verificar logs
- [ ] Escanear QR de WhatsApp
- [ ] Probar con mensaje de prueba

## 🚀 Comando Rápido para GitHub

```bash
# Crear .env.production primero, luego:
git add .
git commit -m "feat: bot multi-agente listo para EasyPanel"
git push origin main
```

## 📞 Siguiente Paso

¿Quieres que cree el archivo `.env.production` con la configuración correcta para EasyPanel?

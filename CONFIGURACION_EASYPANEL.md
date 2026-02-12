# 🗄️ Configuración de PostgreSQL en EasyPanel

## 📊 Información de tu Base de Datos

### Desde el Panel de EasyPanel
**URL del Panel**: http://164.68.122.5:3000/projects/ollama/postgres/postgres-whatsapp

### Credenciales Identificadas

#### Conexión Externa (desde tu PC):
```env
Host: 164.68.122.5
Puerto: 6432
Usuario: postgres
Contraseña: 67I5320D
Base de datos: whatsappdb
```

#### Conexión Interna (desde EasyPanel):
```env
Host: ollama_postgres-whatsapp
Puerto: 5432
Usuario: postgres
Contraseña: 67I5320D
Base de datos: whatsappdb
```

## 🔧 Configuración Correcta para tu Proyecto

### Para Desarrollo Local (Bloqueado por Firewall)

```env
# .env (local - NO funcionará por firewall)
DATABASE_URL="postgresql://postgres:67I5320D@164.68.122.5:6432/whatsappdb?sslmode=disable"
```

### Para Producción en EasyPanel (✅ Recomendado)

```env
# .env.production (en EasyPanel - red interna)
DATABASE_URL="postgresql://postgres:67I5320D@ollama_postgres-whatsapp:5432/whatsappdb?sslmode=disable"
```

## 🚀 Tu Aplicación en EasyPanel

### Estructura de Proyectos en EasyPanel

```
EasyPanel
└── Proyecto: ollama
    ├── PostgreSQL: postgres-whatsapp
    │   ├── Host interno: ollama_postgres-whatsapp
    │   ├── Puerto interno: 5432
    │   ├── Puerto externo: 6432
    │   └── Base de datos: whatsappdb
    │
    └── Aplicación: [tu-app-whatsapp]
        ├── Puerto: 3000 (probablemente)
        └── Conecta a: ollama_postgres-whatsapp:5432
```

## 📋 Cómo Funciona la Conexión

### Desde tu Aplicación en EasyPanel (✅ Funciona)

```typescript
// Tu aplicación usa Prisma con DATABASE_URL
// Prisma se conecta a: ollama_postgres-whatsapp:5432
// Esto funciona porque están en la misma red interna de Docker

const prisma = new PrismaClient();
// ✅ Conexión exitosa
```

### Desde tu PC Local (❌ Bloqueado)

```bash
# Intentas conectar a: 164.68.122.5:6432
# Firewall de EasyPanel bloquea la conexión
# ❌ ECONNREFUSED
```

## 🔍 Verificar tu Aplicación

### Opción 1: Acceder al Dashboard de tu App

Si tu aplicación tiene un dashboard web, debería estar en:
```
http://164.68.122.5:[PUERTO_DE_TU_APP]/
```

Posibles puertos:
- http://164.68.122.5:3001/
- http://164.68.122.5:8080/
- http://164.68.122.5:4000/

### Opción 2: Ver Logs en EasyPanel

1. Accede a EasyPanel: http://164.68.122.5:3000/
2. Ve a tu proyecto "ollama"
3. Selecciona tu aplicación de WhatsApp
4. Ve a la pestaña "Logs"
5. Verifica:
   - ✅ Conexión a PostgreSQL exitosa
   - ✅ WhatsApp conectado
   - ✅ Groq API funcionando

### Opción 3: Conectar vía SSH/Terminal

Si tienes acceso SSH a EasyPanel:

```bash
# Conectar al contenedor de tu app
docker exec -it [nombre-contenedor-app] sh

# Probar conexión a PostgreSQL
psql postgresql://postgres:67I5320D@ollama_postgres-whatsapp:5432/whatsappdb

# Ver tablas
\dt

# Salir
\q
```

## 🎯 Próximos Pasos

### 1. Identificar tu Aplicación en EasyPanel

Necesitas saber:
- ¿Cuál es el nombre de tu servicio/app en EasyPanel?
- ¿En qué puerto está corriendo?
- ¿Está usando la configuración correcta?

### 2. Verificar Variables de Entorno en EasyPanel

En el panel de EasyPanel, verifica que tu app tenga:

```env
DATABASE_URL=postgresql://postgres:67I5320D@ollama_postgres-whatsapp:5432/whatsappdb?sslmode=disable
GROQ_API_KEY=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
NODE_ENV=production
PORT=3000
```

### 3. Verificar que la App Esté Corriendo

En EasyPanel:
- Estado del servicio: ✅ Running
- Logs: Sin errores
- Conexión a BD: ✅ Exitosa

## 💡 Recomendación

**Para trabajar localmente**, tienes 2 opciones:

### Opción A: Usar Base de Datos Local

```bash
# Iniciar PostgreSQL local
docker run -d --name postgres-local \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=whatsappdb \
  -p 5432:5432 \
  postgres:15

# Actualizar .env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/whatsappdb"

# Aplicar esquema
npx prisma db push

# Iniciar app
npm run dev
```

### Opción B: Trabajar Directamente en EasyPanel

1. Hacer cambios en tu código local
2. Commit y push a GitHub
3. EasyPanel hace deploy automático
4. Verificar en producción

## 🔐 Seguridad

⚠️ **IMPORTANTE**: La contraseña `67I5320D` está expuesta. Considera:
1. Cambiarla en EasyPanel
2. Usar variables de entorno secretas
3. No commitear credenciales a GitHub

## 📞 ¿Necesitas Ayuda?

Dime:
1. ¿Cuál es el nombre de tu aplicación en EasyPanel?
2. ¿En qué puerto está corriendo?
3. ¿Quieres trabajar localmente o en EasyPanel?

Así puedo ayudarte mejor con la configuración específica.

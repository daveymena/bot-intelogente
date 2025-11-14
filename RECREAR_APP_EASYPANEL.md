# 🔄 Recrear App en Easypanel (Solución Limpia)

## ✅ Por qué es buena idea

- Configuración limpia desde cero
- Git funcionará correctamente
- Sin conflictos de archivos
- Deploy automático funcionará
- **Tiempo**: 10-15 minutos

---

## ⚠️ IMPORTANTE: Backup Primero

### 1. Backup de Base de Datos

**Si usas PostgreSQL en Easypanel:**
- La base de datos es un servicio separado
- **NO se borrará** al eliminar la app
- Solo necesitas reconectarla

**Si usas SQLite (archivo local):**
- ⚠️ **SE PERDERÁ** al eliminar la app
- Haz backup antes (ver abajo)

### 2. Backup de Productos (Por si acaso)

Desde el terminal de Easypanel (antes de eliminar):
```bash
cd /app
npx tsx scripts/exportar-productos-completo.ts
# Descarga el archivo catalogo-completo-68-productos.json
```

O simplemente usa el que ya tienes en tu repo local ✅

---

## 📋 Checklist Pre-Eliminación

Anota esta información (la necesitarás):

### Variables de Entorno
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-... (si tienes)
CLAUDE_API_KEY=... (si tienes)
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=https://tu-dominio.com
```

### Información de la Base de Datos
- Nombre del servicio de PostgreSQL
- Usuario
- Contraseña
- Puerto
- Nombre de la base de datos

### Dominio
- Tu dominio personalizado (si tienes)

---

## 🗑️ Paso 1: Eliminar la App Actual

1. Ve a Easypanel
2. Selecciona tu app
3. Ve a **"Settings"**
4. Scroll hasta abajo
5. Haz clic en **"Delete App"** o **"Remove"**
6. Confirma

**Nota**: La base de datos PostgreSQL NO se eliminará (es un servicio separado)

---

## ✨ Paso 2: Crear Nueva App

### 2.1 Crear App desde GitHub

1. En Easypanel, haz clic en **"+ New"** o **"Create App"**
2. Selecciona **"From GitHub"**
3. Conecta tu cuenta de GitHub (si no está conectada)
4. Selecciona el repositorio: **`daveymena/bot-intelogente`**
5. Branch: **`main`**
6. Haz clic en **"Create"**

### 2.2 Configurar Build

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npm start
```

**Port:**
```
3000
```

**Node Version:**
```
20.18.1
```
(O la última LTS disponible)

---

## ⚙️ Paso 3: Configurar Variables de Entorno

Ve a **"Environment Variables"** y agrega:

### Variables Esenciales
```env
# Base de Datos
DATABASE_URL=postgresql://usuario:password@postgres:5432/nombre_db

# AI
GROQ_API_KEY=gsk_tu_key_aqui

# Entorno
NODE_ENV=production
PORT=3000

# URL Pública (tu dominio)
NEXT_PUBLIC_API_URL=https://tu-dominio.com
```

### Variables Opcionales (si las tienes)
```env
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=...
GEMINI_API_KEY=...
MISTRAL_API_KEY=...
AI_FALLBACK_ENABLED=true
```

---

## 🔗 Paso 4: Conectar Base de Datos

### Si tienes PostgreSQL en Easypanel:

1. Ve a **"Services"** en Easypanel
2. Encuentra tu servicio de PostgreSQL
3. Copia la **Connection String**
4. Pégala en `DATABASE_URL` de tu nueva app

### Formato de Connection String:
```
postgresql://usuario:password@nombre-servicio:5432/nombre_db
```

**Ejemplo:**
```
postgresql://postgres:mipassword@postgres-bot:5432/botdb
```

---

## 🚀 Paso 5: Deploy

1. Guarda todas las variables de entorno
2. Haz clic en **"Deploy"** o **"Build"**
3. Espera 5-10 minutos
4. Observa los logs para verificar que no haya errores

### Logs que deberías ver:
```
✓ Installing dependencies...
✓ Generating Prisma Client...
✓ Building Next.js...
✓ Starting server on port 3000...
```

---

## 🔍 Paso 6: Verificar que Todo Funcione

### 6.1 Verificar Dashboard
```
https://tu-dominio.com
```

### 6.2 Verificar Base de Datos
```bash
# Desde terminal de Easypanel
npx tsx scripts/diagnosticar-whatsapp-completo.ts
```

Deberías ver:
- ✅ Usuarios existentes
- ✅ Productos (68 o los que tenías)
- ✅ Conversaciones

### 6.3 Verificar WhatsApp

Si la conexión se perdió:
```bash
npx tsx scripts/arreglar-conexion-whatsapp.ts
```

O reconecta desde el dashboard escaneando el QR.

---

## 📦 Paso 7: Restaurar Productos (Si es necesario)

Si perdiste los productos o quieres empezar de cero:

```bash
# Importar catálogo completo
npx tsx scripts/importar-productos-completo.ts

# O importar desde JSON
npx tsx scripts/importar-desde-json.ts
```

---

## 🌐 Paso 8: Configurar Dominio (Opcional)

Si tienes un dominio personalizado:

1. Ve a **"Domains"** en tu app
2. Agrega tu dominio
3. Configura los DNS según las instrucciones
4. Espera a que propague (5-30 minutos)

---

## ✅ Checklist Post-Creación

- [ ] App creada desde GitHub
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada
- [ ] Deploy exitoso
- [ ] Dashboard accesible
- [ ] Productos visibles (68)
- [ ] WhatsApp conectado (o reconectado)
- [ ] Sin errores en logs
- [ ] Auto-deploy activado
- [ ] Dominio configurado (si aplica)

---

## 🎯 Ventajas de Recrear

### ✅ Beneficios:
- Git funcionará correctamente
- Auto-deploy funcionará
- Configuración limpia
- Sin archivos conflictivos
- Permisos correctos
- Última versión del código

### ⏱️ Tiempo:
- Eliminación: 1 minuto
- Creación: 2 minutos
- Configuración: 5 minutos
- Deploy: 5-10 minutos
- **Total: 15 minutos**

---

## 🆘 Si Algo Sale Mal

### Problema: No puedo conectar a la base de datos
**Solución**: Verifica que el nombre del servicio sea correcto en `DATABASE_URL`

### Problema: Build falla
**Solución**: Revisa los logs, probablemente falta una variable de entorno

### Problema: Perdí los productos
**Solución**: 
```bash
npx tsx scripts/importar-desde-json.ts
```

### Problema: WhatsApp no conecta
**Solución**: Escanea el QR nuevamente desde el dashboard

---

## 💡 Recomendación Final

**SÍ, elimina y recrea la app**. Es la solución más limpia y rápida. Solo asegúrate de:

1. ✅ Anotar las variables de entorno
2. ✅ Verificar que la base de datos es un servicio separado
3. ✅ Tener el backup de productos (ya lo tienes en Git)

**Tiempo total**: 15 minutos  
**Resultado**: App funcionando perfectamente con Git ✅

---

**Fecha**: 4 de noviembre de 2025  
**Recomendación**: ✅ RECREAR APP  
**Dificultad**: Fácil  
**Tiempo**: 15 minutos

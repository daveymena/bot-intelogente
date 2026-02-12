# 🔍 DIAGNÓSTICO COMPLETO: App No Abre en Easypanel

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. **PROBLEMA DE PUERTO** ⚠️
```typescript
// En server.ts línea 8:
const currentPort = parseInt(process.env.PORT || '4000', 10);
```
**❌ PROBLEMA**: Easypanel espera puerto 3000, pero el servidor usa 4000 por defecto.

### 2. **PROBLEMA DE DOCKERFILE** ⚠️
```dockerfile
# En Dockerfile línea 42:
EXPOSE 3000
# Pero en CMD usa npm start que ejecuta server.ts con puerto 4000
```
**❌ PROBLEMA**: Inconsistencia entre puerto expuesto y puerto usado.

### 3. **PROBLEMA DE VARIABLES DE ENTORNO** ⚠️
El servidor necesita estas variables críticas que pueden faltar:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` 
- `JWT_SECRET`

---

## ✅ SOLUCIONES INMEDIATAS

### SOLUCIÓN 1: Corregir Puerto en server.ts

```typescript
// Cambiar línea 8 en server.ts:
const currentPort = parseInt(process.env.PORT || '3000', 10);
```

### SOLUCIÓN 2: Corregir Dockerfile

```dockerfile
# Cambiar línea 42 en Dockerfile:
EXPOSE 3000

# Y asegurar que CMD use puerto 3000:
CMD ["sh", "-c", "PORT=3000 npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]
```

### SOLUCIÓN 3: Variables de Entorno Críticas

Asegurar que estas variables estén en Easypanel:

```env
# CRÍTICAS (sin estas la app no inicia)
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production

# AUTENTICACIÓN
NEXTAUTH_SECRET=tu_secret_aqui
JWT_SECRET=tu_jwt_secret_aqui
NEXTAUTH_URL=https://tu-dominio.easypanel.host

# IA (OPCIONAL - tiene fallbacks)
GROQ_API_KEY=tu_groq_key_aqui
OLLAMA_BASE_URL=http://ollama:11434
```

---

## 🔧 ARCHIVOS A MODIFICAR

### 1. server.ts
```typescript
// ANTES:
const currentPort = parseInt(process.env.PORT || '4000', 10);

// DESPUÉS:
const currentPort = parseInt(process.env.PORT || '3000', 10);
```

### 2. Dockerfile
```dockerfile
# ANTES:
EXPOSE 3000
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]

# DESPUÉS:
EXPOSE 3000
CMD ["sh", "-c", "PORT=3000 npx prisma generate && npx prisma db push --accept-data-loss || true && npm start"]
```

### 3. package.json (verificar script start)
```json
{
  "scripts": {
    "start": "NODE_ENV=production npx tsx server.ts"
  }
}
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

### En Easypanel - Variables de Entorno:
- [ ] `DATABASE_URL` configurada
- [ ] `PORT=3000` configurada
- [ ] `NODE_ENV=production` configurada
- [ ] `NEXTAUTH_SECRET` configurada
- [ ] `NEXTAUTH_URL` configurada con tu dominio

### En Easypanel - Configuración:
- [ ] Puerto de la aplicación: **3000**
- [ ] Dominio configurado
- [ ] SSL habilitado
- [ ] Volúmenes persistentes:
  - [ ] `/app/auth_sessions` (WhatsApp)
  - [ ] `/app/public/fotos` (Imágenes)

### En el Código:
- [ ] server.ts usa puerto 3000 por defecto
- [ ] Dockerfile expone puerto 3000
- [ ] CMD en Dockerfile fuerza PORT=3000

---

## 🚀 PASOS PARA ARREGLAR

### Paso 1: Corregir Código
```bash
# 1. Editar server.ts
# Cambiar línea 8: const currentPort = parseInt(process.env.PORT || '3000', 10);

# 2. Editar Dockerfile  
# Cambiar CMD para forzar PORT=3000

# 3. Commit y push
git add server.ts Dockerfile
git commit -m "fix: corregir puerto 3000 para Easypanel"
git push origin main
```

### Paso 2: Actualizar Easypanel
```bash
# 1. En Easypanel → Tu proyecto → Git
# 2. Pull latest changes
# 3. Rebuild
```

### Paso 3: Verificar Variables
```bash
# En Easypanel → Settings → Environment
# Asegurar que PORT=3000 esté configurada
```

### Paso 4: Verificar Logs
```bash
# En Easypanel → Logs
# Buscar:
✅ Ready on http://0.0.0.0:3000
✅ Socket.IO server running
✅ Baileys initialized
```

---

## 🔍 COMANDOS DE DIAGNÓSTICO

### Para probar localmente:
```bash
# Simular Easypanel localmente:
PORT=3000 NODE_ENV=production npm start
```

### Para ver logs en Easypanel:
```bash
# En la consola de Easypanel:
npm run dev
# O ver logs del contenedor
```

---

## ⚡ SOLUCIÓN RÁPIDA (SI TIENES PRISA)

Si necesitas que funcione YA, usa estas variables en Easypanel:

```env
# FORZAR PUERTO 3000
PORT=3000

# MÍNIMAS PARA QUE FUNCIONE
DATABASE_URL=postgresql://tu_url_aqui
NEXTAUTH_SECRET=cualquier_string_largo_aqui
NODE_ENV=production
NEXTAUTH_URL=https://tu-dominio.easypanel.host

# OPCIONAL (para WhatsApp)
WHATSAPP_SESSION_PATH=/app/auth_sessions

# OPCIONAL (para IA)
GROQ_API_KEY=tu_key_aqui
```

---

## 🎯 RESULTADO ESPERADO

Después de aplicar las correcciones:

```bash
# En los logs de Easypanel deberías ver:
> Ready on http://0.0.0.0:3000
> Socket.IO server running at ws://0.0.0.0:3000/api/socketio
✅ Sistema de suscripciones SaaS activo
> Baileys initialized successfully
```

Y la app debería abrir en: `https://tu-dominio.easypanel.host`

---

## 📞 PRÓXIMOS PASOS

1. **Aplicar correcciones de puerto**
2. **Verificar variables de entorno**
3. **Rebuild en Easypanel**
4. **Verificar que abre correctamente**
5. **Conectar WhatsApp**
6. **Probar funcionalidades**

**Estado**: 🔧 Problemas identificados, soluciones listas para aplicar
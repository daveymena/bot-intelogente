# 🚀 REBUILD EN EASYPANEL - INSTRUCCIONES

## ✅ Dockerfile Optimizado Subido

**Commit**: `2a7d242`  
**Cambios**: Optimización de memoria para evitar exit code 152

---

## 📋 PASOS PARA REBUILD

### 1. Ir a Easypanel
```
https://sqaoeo.easypanel.host
```

### 2. Seleccionar Proyecto
- Click en **"bot-whatsapp"**
- Click en **"bot-whatsapp-inteligente"**

### 3. Pull del Código Actualizado

**Opción A: Auto-Pull (si está configurado)**
- Esperar 1-2 minutos
- Verificar que el commit `2a7d242` aparezca

**Opción B: Pull Manual**
- Click en pestaña **"Code"**
- Click en botón **"Pull"**
- Confirmar

### 4. Rebuild

- Click en pestaña **"Build"**
- Click en botón **"Rebuild"**
- Esperar a que termine (5-10 minutos)

### 5. Monitorear Logs

Buscar en los logs:

```
✅ npm ci --only=production completed
✅ npm install dev dependencies completed  
✅ npx prisma generate completed
✅ npm run build completed
✅ Build successful
```

---

## 🔍 SI EL ERROR PERSISTE

### Opción 1: Aumentar Memoria del Contenedor

1. Click en **"Settings"**
2. Sección **"Resources"**
3. **Memory Limit**: Cambiar a **2048 MB** (2GB)
4. Click **"Save"**
5. Rebuild nuevamente

### Opción 2: Limpiar Caché de Build

1. Click en **"Build"**
2. Click en **"Clear Build Cache"**
3. Rebuild

### Opción 3: Verificar Variables de Entorno

Asegurarse de que estas variables estén configuradas:

```
NODE_OPTIONS=--max-old-space-size=4096
NEXT_TELEMETRY_DISABLED=1
NPM_CONFIG_LOGLEVEL=error
```

---

## 📊 LOGS ESPERADOS

### Build Exitoso ✅
```
Step 1/15 : FROM ghcr.io/puppeteer/puppeteer:21.6.0
Step 2/15 : WORKDIR /app
Step 3/15 : ENV NODE_OPTIONS="--max-old-space-size=4096"
Step 4/15 : COPY package*.json ./
Step 5/15 : RUN npm ci --only=production...
 ✅ added 500 packages in 2m
Step 6/15 : RUN npm install --no-save...
 ✅ added 50 packages in 1m
Step 7/15 : COPY . .
Step 8/15 : RUN npx prisma generate
 ✅ Generated Prisma Client
Step 9/15 : RUN npm run build
 ✅ Creating an optimized production build
 ✅ Compiled successfully
Step 10/15 : RUN npm cache clean --force
 ✅ npm cache verified
...
Successfully built
Successfully tagged easypanel/bot-whatsapp/bot-whatsapp-inteligente
```

### Build Fallido ❌
```
Step 5/15 : RUN npm ci --only=production...
 ❌ npm ERR! code 152
 ❌ Process exited with code 152
```

---

## ✅ DESPUÉS DEL BUILD EXITOSO

### 1. Verificar que el Contenedor Está Corriendo
- Estado debe ser: **"Running"** (verde)
- Uptime debe aumentar

### 2. Verificar Logs de la Aplicación
```
[Server] 🚀 Servidor iniciado en puerto 3000
[Baileys] ✅ WhatsApp service initialized
[Database] ✅ Connected to PostgreSQL
```

### 3. Probar el Bot
- Enviar mensaje desde WhatsApp
- Verificar que responde
- Verificar que envía fotos automáticamente

---

## 🆘 TROUBLESHOOTING

### Error: "Still failing with exit code 152"

**Solución**: Aumentar memoria a 3GB o 4GB

1. Settings → Resources
2. Memory Limit: **3072 MB** o **4096 MB**
3. Rebuild

### Error: "Build timeout"

**Solución**: Aumentar timeout

1. Settings → Build
2. Build Timeout: **20 minutes**
3. Rebuild

### Error: "Cannot find module"

**Solución**: Limpiar y rebuild

```bash
# En Easypanel
1. Clear Build Cache
2. Rebuild
```

---

## 📞 CONTACTO

Si después de estos pasos el error persiste:

1. Tomar screenshot de los logs completos
2. Verificar recursos del servidor en Easypanel
3. Contactar soporte de Easypanel

---

## 🎯 CHECKLIST

- [ ] Pull del código actualizado (commit 2a7d242)
- [ ] Rebuild iniciado
- [ ] Logs muestran instalación exitosa
- [ ] Build completado sin errores
- [ ] Contenedor corriendo
- [ ] Bot responde en WhatsApp
- [ ] Fotos se envían automáticamente
- [ ] Contexto se mantiene

---

**Estado**: ✅ Dockerfile optimizado subido  
**Próximo paso**: Rebuild en Easypanel  
**Tiempo estimado**: 5-10 minutos  
**Fecha**: 20 de Noviembre 2025

🚀 **¡LISTO PARA REBUILD!**

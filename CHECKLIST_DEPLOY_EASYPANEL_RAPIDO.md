# ✅ CHECKLIST RÁPIDO: Deploy en Easypanel

## 🎯 ANTES DE EMPEZAR

- [ ] Tienes cuenta en Easypanel
- [ ] Tienes proyecto creado en Easypanel
- [ ] Código está en GitHub
- [ ] Tienes acceso a base de datos PostgreSQL

---

## 📋 PASO A PASO (15 minutos)

### 1. Verificar Código Local ✅
```bash
# Ejecutar verificación
node verificar-configuracion-easypanel.js

# Debe mostrar: "✅ LISTO PARA DEPLOY"
```

### 2. Subir Cambios a GitHub ✅
```bash
git add .
git commit -m "fix: configuración optimizada para Easypanel"
git push origin main
```

### 3. Configurar Variables en Easypanel 🔧

**Ir a**: Easypanel → Tu Proyecto → Settings → Environment

**Copiar estas variables** (mínimo para funcionar):
```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
PORT=3000
NODE_ENV=production
NEXTAUTH_SECRET=tu_secret_super_largo_minimo_32_caracteres
NEXTAUTH_URL=https://tu-dominio.easypanel.host
```

**Para funcionalidad completa, agregar**:
```env
GROQ_API_KEY=gsk_tu_groq_api_key_aqui
WHATSAPP_SESSION_PATH=/app/auth_sessions
```

### 4. Configurar Recursos 💾

**Ir a**: Easypanel → Tu Proyecto → Settings → Resources

```yaml
CPU: 1 vCPU
Memory: 2GB
Build Memory: 2GB (IMPORTANTE)
```

### 5. Configurar Volúmenes 📁

**Ir a**: Easypanel → Tu Proyecto → Settings → Volumes

```yaml
/app/auth_sessions → Persistent Volume
/app/public/fotos → Persistent Volume
```

### 6. Deploy 🚀

**Ir a**: Easypanel → Tu Proyecto → Git

- [ ] **Pull latest changes**
- [ ] **Rebuild** (esperar 5-10 minutos)
- [ ] **Verificar logs** (sin errores)

### 7. Verificar Funcionamiento ✅

- [ ] **App abre**: `https://tu-dominio.easypanel.host`
- [ ] **Dashboard carga** correctamente
- [ ] **Login funciona** (crear cuenta)
- [ ] **No hay errores** en consola del navegador

---

## 🔍 LOGS ESPERADOS

En Easypanel → Logs, deberías ver:
```bash
✅ Ready on http://0.0.0.0:3000
✅ Socket.IO server running
✅ Sistema de suscripciones SaaS activo
✅ Baileys initialized successfully
```

---

## 🚨 PROBLEMAS COMUNES

### ❌ "App no abre"
**Solución**: Verificar que PORT=3000 esté en variables de entorno

### ❌ "Build falla"
**Solución**: Aumentar Build Memory a 2GB en Resources

### ❌ "Database error"
**Solución**: Verificar que DATABASE_URL sea válida y accesible

### ❌ "500 Internal Error"
**Solución**: Verificar que NEXTAUTH_SECRET esté configurada

---

## 🎯 CONFIGURACIÓN MÍNIMA VS COMPLETA

### Mínima (solo para que abra):
```env
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
NEXTAUTH_SECRET=secret_largo
NEXTAUTH_URL=https://tu-dominio.easypanel.host
```

### Completa (funcionalidad total):
```env
# Mínima +
GROQ_API_KEY=gsk_...
WHATSAPP_SESSION_PATH=/app/auth_sessions
RESEND_API_KEY=re_...
MERCADOPAGO_ACCESS_TOKEN=APP-...
```

---

## 📞 DESPUÉS DEL DEPLOY

### Configurar WhatsApp:
1. Ir al dashboard
2. Sección "WhatsApp"
3. Escanear QR con WhatsApp
4. Verificar conexión

### Probar Bot:
1. Enviar mensaje a tu WhatsApp
2. Bot debe responder automáticamente
3. Probar búsqueda de productos

### Configurar Productos:
1. Dashboard → Productos
2. Importar catálogo
3. Verificar fotos

---

## ✅ CHECKLIST FINAL

- [ ] App abre sin errores
- [ ] Dashboard funciona
- [ ] Login/registro OK
- [ ] WhatsApp conectado
- [ ] Bot responde
- [ ] Productos cargan
- [ ] Fotos se muestran
- [ ] Pagos configurados (opcional)

---

## 🎉 ¡ÉXITO!

Si todos los checks están ✅, tu Smart Sales Bot Pro está funcionando perfectamente en Easypanel.

**URLs importantes**:
- Dashboard: `https://tu-dominio.easypanel.host`
- Catálogo: `https://tu-dominio.easypanel.host/catalogo`
- API: `https://tu-dominio.easypanel.host/api/*`

**Tiempo total**: ~15 minutos  
**Estado**: 🚀 Listo para vender por WhatsApp

---

## 📚 DOCUMENTACIÓN ADICIONAL

- `SOLUCION_EASYPANEL_DEFINITIVA.md` - Guía completa
- `VARIABLES_EASYPANEL_COPIAR_PEGAR.env` - Variables listas
- `verificar-configuracion-easypanel.js` - Script de verificación

**¡Tu bot está listo para generar ventas 24/7!** 💰
# 🚀 CONFIGURAR TU EASYPANEL AHORA

## 📍 TU INFORMACIÓN
- **URL**: https://ollama-rapicredis.ginee6.easypanel.host/
- **Proyecto**: ollama-rapicredis
- **Dominio**: ginee6.easypanel.host

---

## 🎯 PASO 1: CONFIGURAR VARIABLES (5 minutos)

### Ir a Easypanel:
1. **Abrir**: https://easypanel.io
2. **Proyecto**: ollama-rapicredis
3. **Settings** → **Environment**

### Copiar estas variables UNA POR UNA:

#### 🔴 CRÍTICAS (copiar primero):
```
DATABASE_URL
postgresql://usuario:password@host:5432/database
```

```
PORT
3000
```

```
NODE_ENV
production
```

```
NEXTAUTH_SECRET
smart_sales_bot_pro_2025_super_secret_key_muy_largo_y_seguro_para_autenticacion
```

```
JWT_SECRET
jwt_token_secret_diferente_para_smart_sales_bot_pro_2025_muy_seguro
```

```
NEXTAUTH_URL
https://ollama-rapicredis.ginee6.easypanel.host
```

#### 🟡 IMPORTANTES (para que funcione el bot):
```
GROQ_API_KEY
gsk_TU_GROQ_API_KEY_AQUI
```

```
AI_FALLBACK_ENABLED
true
```

```
WHATSAPP_SESSION_PATH
/app/auth_sessions
```

```
NEXT_PUBLIC_BASE_URL
https://ollama-rapicredis.ginee6.easypanel.host
```

---

## 🎯 PASO 2: CONFIGURAR RECURSOS

### En Easypanel → Settings → Resources:
```
CPU: 1 vCPU
Memory: 2GB
Build Memory: 2GB (IMPORTANTE)
Storage: 10GB
```

---

## 🎯 PASO 3: CONFIGURAR VOLÚMENES

### En Easypanel → Settings → Volumes:
```
/app/auth_sessions → Persistent Volume (1GB)
/app/public/fotos → Persistent Volume (2GB)
```

---

## 🎯 PASO 4: DEPLOY

### En Easypanel → Git:
1. **Pull latest changes**
2. **Rebuild** (esperar 5-10 minutos)
3. **Ver logs** para verificar

---

## 🔍 VERIFICAR QUE FUNCIONA

### Logs esperados:
```bash
✅ Ready on http://0.0.0.0:3000
✅ Socket.IO server running
✅ Sistema de suscripciones SaaS activo
```

### Probar la app:
1. **Abrir**: https://ollama-rapicredis.ginee6.easypanel.host/
2. **Debe cargar** el dashboard
3. **Crear cuenta** o iniciar sesión
4. **Conectar WhatsApp** (escanear QR)

---

## 🔧 SI NECESITAS API KEYS

### Groq (para IA):
1. **Ir a**: https://console.groq.com
2. **Crear cuenta** gratis
3. **Generar API Key**
4. **Copiar** y pegar en GROQ_API_KEY

### Resend (para emails):
1. **Ir a**: https://resend.com
2. **Crear cuenta**
3. **Generar API Key**
4. **Copiar** y pegar en RESEND_API_KEY

### MercadoPago (para pagos):
1. **Ir a**: https://www.mercadopago.com.co/developers
2. **Crear aplicación**
3. **Obtener tokens**
4. **Copiar** y pegar en MERCADOPAGO_ACCESS_TOKEN

---

## ⚠️ IMPORTANTE: DATABASE_URL

**DEBES CAMBIAR** esta línea por tu base de datos real:
```
DATABASE_URL=postgresql://usuario:password@host:5432/database
```

**Por ejemplo**:
```
DATABASE_URL=postgresql://smartsales:mipassword@db.easypanel.host:5432/smartsalesbot
```

---

## 🎯 CONFIGURACIÓN MÍNIMA PARA PROBAR

Si solo quieres que la app abra (sin bot completo):

```env
DATABASE_URL=postgresql://tu_url_real_aqui
PORT=3000
NODE_ENV=production
NEXTAUTH_SECRET=smart_sales_bot_pro_2025_super_secret_key_muy_largo_y_seguro_para_autenticacion
NEXTAUTH_URL=https://ollama-rapicredis.ginee6.easypanel.host
```

---

## 🚀 RESULTADO FINAL

Después de configurar todo:

✅ **App funcionando**: https://ollama-rapicredis.ginee6.easypanel.host/  
✅ **Dashboard accesible**  
✅ **WhatsApp conectado**  
✅ **Bot respondiendo 24/7**  
✅ **Ventas automáticas**  

---

## 📞 SI TIENES PROBLEMAS

### App no abre:
- Verificar que PORT=3000 esté configurado
- Verificar que DATABASE_URL sea válida

### Build falla:
- Aumentar Build Memory a 2GB
- Verificar que todas las variables críticas estén configuradas

### Bot no responde:
- Verificar GROQ_API_KEY
- Verificar WHATSAPP_SESSION_PATH

---

## 🎉 ¡LISTO!

Tu Smart Sales Bot Pro estará funcionando en:
**https://ollama-rapicredis.ginee6.easypanel.host/**

**Tiempo estimado**: 10-15 minutos  
**Estado**: 🚀 Listo para generar ventas automáticas por WhatsApp
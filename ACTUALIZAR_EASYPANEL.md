# 🚀 Actualizar en Easypanel

## ✅ Cambios Subidos a GitHub

Commit: `e4312d2`

### Nuevas Funcionalidades:
- ✅ **Verificación de email desactivada** (login directo)
- ✅ **Sistema de auto-recovery** para WhatsApp
- ✅ **Mejoras de IA** con multi-provider fallback
- ✅ **Configuración de pagos** flexible desde dashboard
- ✅ **Ollama integrado** para IA local
- ✅ **Reasoning mejorado** con múltiples proveedores

## 📋 Pasos para Actualizar en Easypanel

### 1. Accede a Easypanel
```
https://easypanel.io
```

### 2. Ve a tu proyecto
- Busca: **bot-intelogente** o **Smart Sales Bot**

### 3. Actualiza desde GitHub
- Clic en **"Deploy"** o **"Redeploy"**
- Easypanel detectará automáticamente el nuevo commit
- O manualmente: **Settings → GitHub → Sync**

### 4. Verifica Variables de Entorno
Asegúrate de tener estas variables en Easypanel:

```env
# Base de datos
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=tu-secret-key-seguro

# IA Principal
GROQ_API_KEY=gsk_...

# Fallback (opcional)
AI_FALLBACK_ENABLED=true
OPENROUTER_API_KEY=sk-or-v1-...

# Pagos
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 5. Reinicia la Aplicación
- Clic en **"Restart"** o **"Rebuild"**
- Espera 2-3 minutos

### 6. Verifica que Funcione
```
https://tu-app.easypanel.host
```

Deberías poder:
- ✅ Hacer login sin verificar email
- ✅ Conectar WhatsApp
- ✅ Ver productos
- ✅ Configurar pagos desde dashboard

## 🔧 Troubleshooting

### Error: "Email not verified"
- Verifica que el código esté actualizado (commit e4312d2)
- Reinicia la app en Easypanel

### Error: Database connection
- Verifica DATABASE_URL en variables de entorno
- Ejecuta migraciones: `npm run db:migrate:deploy`

### WhatsApp no conecta
- Verifica que el puerto esté abierto
- Revisa logs en Easypanel

## 📊 Verificación Post-Deploy

1. **Login**: Prueba con admin@tecnovariedades.com
2. **WhatsApp**: Conecta y escanea QR
3. **Productos**: Verifica que se vean correctamente
4. **Pagos**: Prueba crear un link de pago
5. **IA**: Envía un mensaje de prueba al bot

## 🎯 Próximos Pasos

Una vez funcionando en Easypanel:
1. Configura tu dominio personalizado
2. Activa SSL/HTTPS
3. Configura webhooks de MercadoPago
4. Prueba el sistema completo
5. ¡Empieza a vender!

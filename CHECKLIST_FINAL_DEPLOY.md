# ✅ CHECKLIST FINAL PARA DEPLOY

## 🎯 Pre-Deploy (Local)

### 1. Verificación del Bot
- [x] Tests de simulación ejecutados (86% éxito)
- [x] Super Sales AI funcionando
- [x] Ollama Orchestrator integrado
- [x] Búsqueda semántica activa
- [x] Contexto persistente verificado
- [x] Sistema de fotos operativo
- [x] Sistema de pagos integrado

### 2. Limpieza del Código
```bash
# Ejecutar estos comandos en orden:

# 1. Cerrar puertos ocupados
.\CERRAR_PUERTOS_AHORA.bat

# 2. Limpiar archivos temporales
npm run clean

# 3. Verificar que no hay errores de TypeScript
npm run build

# 4. Verificar base de datos
npx prisma generate
npx prisma db push
```

### 3. Preparar Git
```bash
# Si hay archivos grandes o secretos:
.\LIMPIAR_HISTORIAL_GIT_COMPLETO.bat

# O subida limpia directa:
.\SUBIR_A_GIT_LIMPIO.bat
```

## 🚀 Deploy en Easypanel

### 1. Crear Repositorio Privado en GitHub
```bash
# Opción A: Crear repo nuevo
.\CREAR_REPO_LIMPIO_DESDE_CERO.bat

# Opción B: Usar repo existente
.\SUBIR_A_REPO_PRIVADO.bat
```

### 2. Configurar Easypanel

#### A. Crear Nueva App
1. Ir a Easypanel Dashboard
2. Click en "Create App"
3. Nombre: `smart-sales-bot-pro`
4. Tipo: `GitHub`
5. Seleccionar repositorio privado

#### B. Configurar Build
```dockerfile
# Build Command
npm install && npm run build

# Start Command
npm start

# Port
3000
```

#### C. Variables de Entorno
Copiar de `VARIABLES_EASYPANEL_SUPER_SALES_AI.env`:

```env
# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/db

# IA Principal
GROQ_API_KEY=tu_groq_api_key
AI_PROVIDER=groq
AI_MODEL=llama-3.1-70b-versatile

# Ollama (Opcional - para búsqueda semántica)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
USE_OLLAMA=true

# WhatsApp
WHATSAPP_AUTO_CONNECT=true
WHATSAPP_SESSION_PATH=/app/auth_sessions

# Sistema
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
DEFAULT_USER_ID=tu-user-id

# Email (Opcional)
RESEND_API_KEY=tu_resend_key
EMAIL_FROM=noreply@tu-dominio.com

# Pagos
MERCADOPAGO_ACCESS_TOKEN=tu_token
PAYPAL_CLIENT_ID=tu_client_id
```

### 3. Configurar Base de Datos PostgreSQL

#### En Easypanel:
1. Crear servicio PostgreSQL
2. Copiar `DATABASE_URL`
3. Ejecutar migraciones:

```bash
# En terminal de Easypanel
npx prisma migrate deploy
npx prisma db seed
```

### 4. Configurar Volúmenes Persistentes

```yaml
volumes:
  - /app/auth_sessions  # Sesiones de WhatsApp
  - /app/temp-audio     # Audio temporal
  - /app/temp-images    # Imágenes temporales
```

## ✅ Post-Deploy

### 1. Verificar Servicios
```bash
# Verificar que el servidor está corriendo
curl https://tu-dominio.com/api/health

# Verificar base de datos
curl https://tu-dominio.com/api/stats
```

### 2. Conectar WhatsApp
1. Ir a: `https://tu-dominio.com`
2. Login con usuario admin
3. Click en "Conectar WhatsApp"
4. Escanear QR con WhatsApp
5. Esperar confirmación de conexión

### 3. Probar Bot
Enviar mensajes de prueba:
1. "Hola" → Debe responder con saludo
2. "megapack de idiomas" → Debe mostrar producto
3. "Tienes fotos?" → Debe enviar fotos
4. "Como puedo pagar?" → Debe dar info de pago

### 4. Monitorear Logs
```bash
# En Easypanel, ver logs en tiempo real
# Buscar errores o warnings
```

## 🔧 Troubleshooting

### Problema: Bot no responde
**Solución:**
1. Verificar que WhatsApp está conectado
2. Revisar logs de Easypanel
3. Verificar variables de entorno
4. Reiniciar servicio

### Problema: No encuentra productos
**Solución:**
1. Verificar que la BD tiene productos
2. Ejecutar: `npx prisma db seed`
3. Verificar `DEFAULT_USER_ID`

### Problema: No envía fotos
**Solución:**
1. Verificar que productos tienen imágenes
2. Revisar logs de `photoService`
3. Verificar permisos de volúmenes

### Problema: Error de base de datos
**Solución:**
1. Verificar `DATABASE_URL`
2. Ejecutar migraciones: `npx prisma migrate deploy`
3. Regenerar cliente: `npx prisma generate`

## 📊 Métricas de Éxito

### Después de 24 horas:
- [ ] Bot responde a todos los mensajes
- [ ] Tasa de respuesta > 95%
- [ ] Tiempo de respuesta < 5 segundos
- [ ] Sin errores críticos en logs
- [ ] WhatsApp mantiene conexión estable

### Después de 1 semana:
- [ ] Conversiones de ventas registradas
- [ ] Feedback positivo de usuarios
- [ ] Sistema estable sin caídas
- [ ] Métricas de uso crecientes

## 🎉 Deploy Completado

Una vez verificado todo:
- ✅ Bot funcionando en producción
- ✅ WhatsApp conectado y estable
- ✅ Base de datos operativa
- ✅ Métricas monitoreadas
- ✅ Sistema listo para usuarios reales

---

**Última actualización**: 10 Diciembre 2025
**Versión**: Super Sales AI v2.0
**Estado**: PRODUCTION READY ✅

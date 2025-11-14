# ✅ Checklist de Despliegue

Usa esta lista para asegurarte de que no olvidas nada.

## 📋 Antes de Empezar

- [ ] Código funcionando en local
- [ ] Bot responde correctamente en desarrollo
- [ ] Productos agregados a la base de datos
- [ ] Megapacks configurados
- [ ] Sistema de entrenamiento probado

## 🔑 Credenciales Necesarias

- [ ] API Key de Groq (`https://console.groq.com`)
- [ ] API Key de OpenRouter (`https://openrouter.ai`)
- [ ] Email para admin
- [ ] Password seguro para admin
- [ ] Número de WhatsApp para el bot

## 📤 Preparar Repositorio

- [ ] Código subido a GitHub
- [ ] Rama `main` actualizada
- [ ] `.env` NO subido (está en `.gitignore`)
- [ ] Archivos de configuración incluidos:
  - [ ] `render.yaml`
  - [ ] `Dockerfile`
  - [ ] `.dockerignore`
  - [ ] Guías de deploy

## 🌐 Crear Cuenta en Hosting

### Opción A: Railway (Recomendado)
- [ ] Cuenta creada en `https://railway.app`
- [ ] GitHub conectado
- [ ] $5 de crédito gratis disponible

### Opción B: Render
- [ ] Cuenta creada en `https://render.com`
- [ ] GitHub conectado
- [ ] Tarjeta agregada (para plan Starter)

## 🗄️ Base de Datos

### Railway:
- [ ] PostgreSQL agregado desde dashboard
- [ ] Variable `DATABASE_URL` creada automáticamente

### Render:
- [ ] PostgreSQL Database creado
- [ ] Internal Database URL copiada
- [ ] Variable `DATABASE_URL` configurada

## ⚙️ Variables de Entorno

### Obligatorias:
- [ ] `DATABASE_PROVIDER=postgresql`
- [ ] `DATABASE_URL=[URL de la base de datos]`
- [ ] `NEXTAUTH_SECRET=[Generado con openssl rand -base64 32]`
- [ ] `NEXTAUTH_URL=[URL de tu app]`
- [ ] `NODE_ENV=production`

### IA (al menos una):
- [ ] `GROQ_API_KEY=[Tu key]`
- [ ] `OPENROUTER_API_KEY=[Tu key]`
- [ ] `AI_PROVIDER=openrouter` (o groq)
- [ ] `DEFAULT_AI_PROVIDER=openrouter`
- [ ] `AI_FALLBACK_ENABLED=true`

### WhatsApp:
- [ ] `WHATSAPP_PROVIDER=baileys`
- [ ] `SESSION_PATH=/opt/render/project/src/whatsapp-sessions` (Render)
- [ ] `SESSION_PATH=/app/whatsapp-sessions` (Railway)

### Puppeteer:
- [ ] `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- [ ] `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable`
- [ ] `PUPPETEER_HEADLESS=true`
- [ ] `PUPPETEER_SANDBOX=false`

### Admin:
- [ ] `ADMIN_EMAIL=[Tu email]`
- [ ] `ADMIN_PASSWORD=[Password seguro]`
- [ ] `CREATE_ADMIN=true`
- [ ] `RUN_MIGRATIONS=true`

## 💾 Almacenamiento Persistente

### Render:
- [ ] Disco agregado en Settings
- [ ] Mount Path: `/opt/render/project/src/whatsapp-sessions`
- [ ] Tamaño: 1 GB

### Railway:
- [ ] Volumen agregado en Settings
- [ ] Mount Path: `/app/whatsapp-sessions`
- [ ] Tamaño: 1 GB

## 🚀 Deploy

- [ ] Build Command configurado:
  ```
  npm install && npx prisma generate && npm run build
  ```
- [ ] Start Command configurado:
  ```
  npm start
  ```
- [ ] Deploy iniciado
- [ ] Build completado sin errores
- [ ] Servicio en estado "Live" o "Running"

## ✅ Verificación Post-Deploy

### Página Web:
- [ ] URL abre correctamente
- [ ] Página de login visible
- [ ] No hay errores en consola del navegador

### Login:
- [ ] Puedo iniciar sesión con admin
- [ ] Dashboard carga correctamente
- [ ] No hay errores 500

### Base de Datos:
- [ ] Tablas creadas correctamente
- [ ] Usuario admin existe
- [ ] Productos visibles (si los agregaste)

### WhatsApp:
- [ ] Sección de WhatsApp visible
- [ ] Botón "Conectar" funciona
- [ ] Código QR se genera
- [ ] Puedo escanear el QR
- [ ] Estado cambia a "Conectado"

### Bot:
- [ ] Envío mensaje de prueba al bot
- [ ] Bot responde en menos de 5 segundos
- [ ] Respuesta es coherente
- [ ] Bot reconoce productos
- [ ] Bot reconoce megapacks

## 🔍 Monitoreo

- [ ] Logs del servicio sin errores críticos
- [ ] Conexión de WhatsApp estable
- [ ] Base de datos respondiendo
- [ ] IA respondiendo correctamente

## 📊 Métricas

- [ ] Tiempo de respuesta < 3 segundos
- [ ] Uptime > 99%
- [ ] Memoria < 512MB
- [ ] CPU < 50%

## 🎯 Configuración Final

- [ ] Productos agregados desde dashboard
- [ ] Precios actualizados
- [ ] Links de pago configurados
- [ ] Mensaje de bienvenida personalizado
- [ ] Horarios de atención configurados

## 🔒 Seguridad

- [ ] Password de admin es fuerte
- [ ] API Keys no están en el código
- [ ] `.env` no está en GitHub
- [ ] HTTPS habilitado (automático)
- [ ] Variables de entorno seguras

## 📱 Prueba Final

- [ ] Enviar "Hola" al bot
- [ ] Preguntar por productos
- [ ] Preguntar por megapacks
- [ ] Preguntar precios
- [ ] Solicitar foto de producto
- [ ] Preguntar formas de pago
- [ ] Bot responde todo correctamente

## 🎉 ¡Listo para Producción!

Si marcaste todo ✅, tu bot está:
- ✅ Desplegado correctamente
- ✅ Funcionando 24/7
- ✅ Respondiendo con IA
- ✅ Conectado a WhatsApp
- ✅ Listo para vender

## 📞 Siguiente Paso

- [ ] Compartir número de WhatsApp con clientes
- [ ] Monitorear conversaciones
- [ ] Ajustar respuestas según feedback
- [ ] Agregar más productos
- [ ] ¡Vender! 💰

---

**Tiempo total estimado:** 15-30 minutos
**Dificultad:** Fácil
**Resultado:** Bot funcionando en producción

¡Éxito! 🚀

# ✅ Checklist Completo - Deploy Super Sales AI

## 📋 Pre-Deploy (Local)

### Código
- [x] Super Sales AI implementado (`src/lib/super-sales-ai.ts`)
- [x] Ollama Orchestrator optimizado
- [x] Context Memory Enhanced funcionando
- [x] Semantic Product Search activo
- [x] Baileys Service estable
- [x] Tests pasando (5/5)

### Configuración
- [x] `.env` configurado localmente
- [x] `.gitignore` actualizado
- [x] Variables sensibles excluidas
- [x] Ollama corriendo local
- [x] Base de datos funcionando

### Tests Locales
- [x] Conversación natural ✅
- [x] Búsqueda de productos ✅
- [x] Envío de fotos ✅
- [x] Memoria contextual ✅
- [x] Links de pago ✅

---

## 🔐 GitHub (Repositorio Privado)

### Crear Repositorio
- [ ] Ir a https://github.com/new
- [ ] Nombre: `whatsapp-bot-private`
- [ ] Visibilidad: **PRIVATE** ✅
- [ ] NO inicializar con README
- [ ] Crear repositorio

### Subir Código
- [ ] Ejecutar `SUBIR_A_REPO_PRIVADO.bat`
- [ ] Verificar que subió: https://github.com/daveymena/whatsapp-bot-private
- [ ] Confirmar que dice **🔒 Private**

---

## 🚀 Easypanel (Deploy)

### Crear Proyecto
- [ ] Ir a https://easypanel.io
- [ ] Login con tu cuenta
- [ ] **Create New Project**
- [ ] Seleccionar **From GitHub**
- [ ] Elegir `daveymena/whatsapp-bot-private`
- [ ] Branch: `main`

### Configurar Build
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Port: `3000`
- [ ] Node Version: `18` o superior

### Variables de Entorno

#### Ollama (CRÍTICO)
- [ ] `OLLAMA_BASE_URL=https://davey-ollama2.mapf5v.easypanel.host`
- [ ] `OLLAMA_MODEL=llama3.2:3b`
- [ ] `OLLAMA_TIMEOUT=30000`

#### Base de Datos (CRÍTICO)
- [ ] `DATABASE_URL=postgresql://...` (de Easypanel)
- [ ] Verificar conexión a PostgreSQL

#### IA (CRÍTICO)
- [ ] `GROQ_API_KEY=gsk_...`
- [ ] `AI_FALLBACK_ENABLED=true`
- [ ] `OPENAI_API_KEY=sk-...` (opcional)

#### Sistema (CRÍTICO)
- [ ] `NODE_ENV=production`
- [ ] `ENABLE_SUPER_SALES_AI=true`
- [ ] `ENABLE_OLLAMA=true`
- [ ] `ENABLE_SEMANTIC_SEARCH=true`

#### URLs (CRÍTICO)
- [ ] `NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host`
- [ ] `NEXTAUTH_URL=https://tu-app.easypanel.host`
- [ ] `NEXTAUTH_SECRET=` (generar con `openssl rand -base64 32`)

#### WhatsApp
- [ ] `WHATSAPP_SESSION_PATH=/app/auth_sessions`
- [ ] `WHATSAPP_AUTO_RECONNECT=true`
- [ ] `WHATSAPP_MAX_RETRIES=5`

#### Pagos (Opcional)
- [ ] `MERCADOPAGO_ACCESS_TOKEN=...`
- [ ] `PAYPAL_CLIENT_ID=...`
- [ ] `PAYPAL_CLIENT_SECRET=...`

#### Email (Opcional)
- [ ] `RESEND_API_KEY=...`
- [ ] `EMAIL_FROM=...`

### Deploy
- [ ] Click en **Deploy**
- [ ] Esperar build (5-10 minutos)
- [ ] Verificar logs sin errores
- [ ] Confirmar que está **Running**

---

## 🔌 Post-Deploy

### Verificar Aplicación
- [ ] Abrir: `https://tu-app.easypanel.host`
- [ ] Página carga correctamente
- [ ] No hay errores en consola

### Crear Usuario Admin
- [ ] Login o registro
- [ ] Verificar acceso al dashboard
- [ ] Ver productos cargados

### Conectar WhatsApp
- [ ] Ir a "WhatsApp Connection"
- [ ] Click en "Connect WhatsApp"
- [ ] Escanear QR con WhatsApp
- [ ] Esperar mensaje "Connected"
- [ ] Verificar estado: **✅ Connected**

### Migrar Base de Datos
- [ ] Ejecutar en Easypanel Console:
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```
- [ ] Verificar que las tablas existen

### Importar Productos (Opcional)
- [ ] Ir a "Products Management"
- [ ] Click en "Import Products"
- [ ] Subir CSV/JSON
- [ ] Verificar productos importados

---

## 🧪 Tests en Producción

### Test 1: Saludo
```
Enviar a WhatsApp: "Hola"
Esperar: Respuesta natural del bot
```
- [ ] Bot responde
- [ ] Respuesta es natural
- [ ] Incluye retorno a venta

### Test 2: Búsqueda
```
Enviar: "Busco un portátil para diseño"
Esperar: Lista de productos relevantes
```
- [ ] Bot encuentra productos
- [ ] Productos son relevantes
- [ ] Incluye fotos
- [ ] Formato es claro

### Test 3: Contexto
```
Enviar: "Cuéntame más del primero"
Esperar: Detalles del producto anterior
```
- [ ] Bot recuerda el contexto
- [ ] Responde sobre el producto correcto
- [ ] Información es precisa

### Test 4: Fotos
```
Enviar: "Envíame fotos"
Esperar: Fotos del producto en contexto
```
- [ ] Bot envía fotos
- [ ] Fotos son del producto correcto
- [ ] Calidad es buena

### Test 5: Pago
```
Enviar: "Quiero comprarlo"
Esperar: Link de pago
```
- [ ] Bot genera link
- [ ] Link funciona
- [ ] Lleva a página de pago correcta

### Test 6: Conversación Natural
```
Enviar: "¿Cómo está el clima?"
Esperar: Respuesta natural + retorno a venta
```
- [ ] Bot responde naturalmente
- [ ] No se confunde
- [ ] Retorna a la venta sutilmente

---

## 📊 Monitoreo

### Logs
- [ ] Revisar logs en Easypanel
- [ ] No hay errores críticos
- [ ] Respuestas son rápidas (< 1s)

### Métricas
- [ ] Tiempo de respuesta: < 1000ms
- [ ] Tasa de error: < 1%
- [ ] Conexión WhatsApp: Estable
- [ ] Uso de memoria: Normal

### Base de Datos
- [ ] Conexiones activas: Normal
- [ ] Queries rápidas
- [ ] Sin deadlocks
- [ ] Backups configurados

---

## 🔧 Troubleshooting

### Si el bot no responde:
1. [ ] Verificar conexión WhatsApp
2. [ ] Revisar logs de Easypanel
3. [ ] Comprobar variables de entorno
4. [ ] Verificar Ollama está corriendo
5. [ ] Reiniciar aplicación

### Si las búsquedas fallan:
1. [ ] Verificar `OLLAMA_BASE_URL`
2. [ ] Comprobar modelo descargado
3. [ ] Revisar timeout de Ollama
4. [ ] Verificar productos en BD

### Si no envía fotos:
1. [ ] Verificar URLs de imágenes
2. [ ] Comprobar permisos de archivos
3. [ ] Revisar logs de media service
4. [ ] Verificar conexión a storage

### Si falla el pago:
1. [ ] Verificar credenciales de pago
2. [ ] Comprobar URLs de webhook
3. [ ] Revisar logs de payment service
4. [ ] Verificar configuración de métodos

---

## ✅ Checklist Final

- [ ] ✅ Código subido a GitHub (privado)
- [ ] ✅ Deploy en Easypanel exitoso
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ WhatsApp conectado
- [ ] ✅ Base de datos migrada
- [ ] ✅ Productos importados
- [ ] ✅ Tests pasando (6/6)
- [ ] ✅ Logs sin errores
- [ ] ✅ Monitoreo activo
- [ ] ✅ Backups configurados

---

## 🎉 ¡Deploy Completo!

Tu Super Sales AI está en producción y listo para vender.

**Próximos pasos**:
1. Monitorear primeras conversaciones
2. Ajustar respuestas si es necesario
3. Agregar más productos
4. Configurar analytics
5. Escalar según demanda

🚀 **¡A vender!**

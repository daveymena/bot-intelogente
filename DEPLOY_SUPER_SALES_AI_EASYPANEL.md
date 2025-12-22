# 🚀 Deploy Super Sales AI a Easypanel

## ✅ Sistema Listo para Producción

El **Super Sales AI** está completamente integrado y probado. Ahora vamos a desplegarlo en Easypanel.

---

## 📋 Pre-requisitos

1. ✅ Ollama corriendo en Easypanel: `https://davey-ollama2.mapf5v.easypanel.host`
2. ✅ PostgreSQL configurado en Easypanel
3. ✅ Repositorio Git actualizado
4. ✅ Variables de entorno preparadas

---

## 🎯 Paso 1: Subir Código a Git

```bash
# Limpiar archivos temporales
git add .
git commit -m "feat: Super Sales AI integrado - Sistema conversacional completo"
git push origin main
```

---

## 🎯 Paso 2: Configurar Variables en Easypanel

Ve a tu app en Easypanel → **Environment** y agrega estas variables:

### 🤖 IA - Ollama (CRÍTICO)
```env
OLLAMA_BASE_URL=https://davey-ollama2.mapf5v.easypanel.host
OLLAMA_URL=https://davey-ollama2.mapf5v.easypanel.host
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT=30000
```

### 🗄️ Base de Datos (CRÍTICO)
```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
```

### 🌐 Aplicación (CRÍTICO)
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://tu-app.easypanel.host
```

### 🔐 Seguridad (CRÍTICO)
```env
JWT_SECRET=genera_un_secret_aleatorio_aqui
NEXTAUTH_SECRET=genera_otro_secret_aleatorio_aqui
NEXTAUTH_URL=https://tu-app.easypanel.host
```

### ⚡ Optimizaciones (RECOMENDADO)
```env
ENABLE_SUPER_SALES_AI=true
ENABLE_PHOTO_AUTO_SEND=true
ENABLE_CONTEXT_MEMORY=true
ENABLE_SEMANTIC_SEARCH=true
```

### 🔑 Opcionales
```env
GROQ_API_KEY=tu_groq_key_para_fallback
MERCADOPAGO_ACCESS_TOKEN=tu_token_mercadopago
EMAIL_FROM=noreply@tudominio.com
RESEND_API_KEY=tu_resend_key
```

---

## 🎯 Paso 3: Deploy en Easypanel

### Opción A: Deploy desde Git (Recomendado)

1. Ve a tu app en Easypanel
2. Click en **Deploy**
3. Selecciona **Deploy from Git**
4. Espera a que termine el build
5. ✅ Listo!

### Opción B: Rebuild Completo

```bash
# En Easypanel Console
npm install
npm run db:push
npm run build
npm start
```

---

## 🎯 Paso 4: Verificar que Funciona

### 1. Verificar Ollama
```bash
curl https://davey-ollama2.mapf5v.easypanel.host/api/tags
```

Debe responder con lista de modelos.

### 2. Verificar App
```bash
curl https://tu-app.easypanel.host/api/health
```

### 3. Verificar Base de Datos
```bash
# En Easypanel Console
npx prisma db push
```

---

## 🎯 Paso 5: Conectar WhatsApp

1. Abre tu app: `https://tu-app.easypanel.host`
2. Login con tu usuario
3. Ve a **WhatsApp Connection**
4. Escanea el QR con WhatsApp
5. ✅ Bot activo!

---

## 🧪 Probar el Super Sales AI

Envía estos mensajes a tu WhatsApp:

### Test 1: Saludo
```
Hola! Cómo estás?
```
**Esperado:** Respuesta amigable y natural

### Test 2: Consulta de Producto
```
Me interesa un curso de piano
```
**Esperado:** Información del producto + foto automática

### Test 3: Conversación Casual
```
Qué tal el clima hoy?
```
**Esperado:** Respuesta casual manteniendo contexto

### Test 4: Retorno a Venta
```
Cuéntame un chiste
```
**Esperado:** Responde al chiste y luego retorna al producto

### Test 5: Compra
```
Quiero comprar el curso
```
**Esperado:** Links de pago generados

---

## 🎨 Características del Super Sales AI

### ✅ Lo que hace AUTOMÁTICAMENTE:

1. **Conversación Natural**
   - Responde a saludos, preguntas casuales, chistes
   - Mantiene tono amigable y profesional
   - Usa emojis apropiados

2. **Búsqueda Inteligente**
   - Encuentra productos por nombre, categoría, precio
   - Búsqueda semántica con Ollama
   - Entiende sinónimos y variaciones

3. **Envío de Fotos Automático**
   - Detecta cuando menciona un producto
   - Envía fotos sin que el cliente las pida
   - Máximo 3 fotos por producto

4. **Memoria de Contexto**
   - Recuerda el producto que le interesa
   - Mantiene conversación coherente
   - Retorna a la venta naturalmente

5. **Generación de Pagos**
   - Detecta intención de compra
   - Genera links de MercadoPago, PayPal, etc.
   - Información clara de pago

---

## 🔧 Troubleshooting

### Problema: Bot no responde
**Solución:**
```bash
# Verificar logs en Easypanel
# Verificar que Ollama esté corriendo
curl https://davey-ollama2.mapf5v.easypanel.host/api/tags
```

### Problema: No encuentra productos
**Solución:**
```bash
# Verificar base de datos
npx prisma studio
# Verificar que hay productos con userId correcto
```

### Problema: No envía fotos
**Solución:**
```env
# Verificar variable
ENABLE_PHOTO_AUTO_SEND=true
# Verificar que productos tienen URLs de imágenes válidas
```

### Problema: Respuestas lentas
**Solución:**
```env
# Usar modelo más rápido
OLLAMA_MODEL=llama3.2:3b  # ⚡ Más rápido (527ms)
# O
OLLAMA_MODEL=gemma2:2b    # 🚀 Súper rápido (670ms)
```

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real
```bash
# En Easypanel Console
npm run logs
```

### Ver Estadísticas
```bash
# Acceder a
https://tu-app.easypanel.host/api/stats
```

---

## 🎯 Próximos Pasos

1. ✅ Deploy completado
2. ✅ WhatsApp conectado
3. ✅ Bot respondiendo
4. 📈 Monitorear conversaciones
5. 🎨 Personalizar respuestas si es necesario
6. 📊 Analizar métricas de ventas

---

## 🆘 Soporte

Si algo no funciona:

1. Revisa los logs en Easypanel
2. Verifica las variables de entorno
3. Confirma que Ollama está corriendo
4. Revisa la conexión de WhatsApp

---

## ✨ Resultado Final

Un bot de WhatsApp que:
- ✅ Conversa naturalmente sobre cualquier tema
- ✅ Busca y recomienda productos inteligentemente
- ✅ Envía fotos automáticamente
- ✅ Mantiene contexto de venta
- ✅ Genera links de pago
- ✅ Funciona 24/7 sin intervención humana

**¡Tu asistente de ventas con IA está listo! 🚀**

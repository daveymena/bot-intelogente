# ⚡ COMANDOS RÁPIDOS - BOT 24/7

## 🚀 Inicio Rápido

```bash
# Windows - Todo en uno
INICIAR_BOT_24_7.bat

# Manual - Paso a paso
npx tsx scripts/entrenar-bot-24-7-completo.ts
npm run dev
```

## 🎓 Entrenamiento

```bash
# Entrenamiento completo
npx tsx scripts/entrenar-bot-24-7-completo.ts

# Ver estadísticas de entrenamiento
npx tsx scripts/ver-stats-entrenamiento.ts

# Recargar entrenamiento sin reiniciar
# (Desde el código)
Training24_7Service.reload()
```

## 🧪 Testing

```bash
# Test completo del sistema
npx tsx scripts/test-bot-24-7-complete.ts

# Test de respuestas humanizadas
npx tsx scripts/test-humanized-responses.ts

# Test de envío de fotos
npx tsx scripts/test-photo-sending.ts

# Test de Groq
npx tsx test-24-7-groq.js

# Test de Ollama
npx tsx test-ollama-real.js
```

## 📊 Monitoreo

```bash
# Ver métricas en vivo
# http://localhost:3000/dashboard/metrics

# Ver conversaciones activas
# http://localhost:3000/dashboard/conversations

# Ver productos más consultados
# http://localhost:3000/dashboard/products

# Logs en tiempo real
npm run dev
# (Los logs aparecen en la consola)
```

## 🔧 Configuración

```bash
# Editar variables de entorno
notepad .env

# Variables clave:
# GROQ_API_KEY=gsk_...
# OLLAMA_ENABLED=true
# ENABLE_PHOTO_SENDING=true
```

## 📸 Gestión de Fotos

```bash
# Verificar imágenes de productos
npx tsx scripts/verificar-imagenes-productos.ts

# Actualizar fotos de productos
npx tsx scripts/actualizar-fotos-productos.ts

# Agregar fotos manualmente
# 1. Sube imagen a public/uploads/products/
# 2. Actualiza producto en dashboard
```

## 🗄️ Base de Datos

```bash
# Ver productos
npx tsx scripts/ver-productos.ts

# Agregar producto
# Usa el dashboard: http://localhost:3000/dashboard/products

# Limpiar duplicados
npx tsx scripts/limpiar-duplicados.ts

# Reset completo (¡CUIDADO!)
npm run db:reset
```

## 🔄 Mantenimiento

```bash
# Reiniciar servidor
Ctrl+C
npm run dev

# Limpiar cache de Node
rm -rf node_modules
npm install

# Actualizar dependencias
npm update

# Rebuild completo
npm run build
```

## 🐛 Debugging

```bash
# Ver logs detallados
# Los logs aparecen automáticamente en la consola

# Verificar conexión WhatsApp
# Dashboard → WhatsApp Connection

# Test de conectividad
npx tsx scripts/diagnosticar-whatsapp-conexion.js

# Ver estado del sistema
npx tsx scripts/verificar-sistema.bat
```

## 📦 Productos

```bash
# Importar productos desde JSON
npx tsx scripts/importar-productos-completo.bat

# Exportar productos
npx tsx scripts/exportar-productos.bat

# Actualizar precios masivamente
# Edita el CSV y luego:
npx tsx scripts/actualizar-precios-desde-csv.ts
```

## 🎭 Personalización

```bash
# Cambiar tono del bot
# Edita: src/lib/humanized-response-generator.ts
# Línea: const tone = context.tone || 'friendly'

# Agregar nuevas intenciones
# Edita: src/lib/product-intelligence-service.ts

# Personalizar respuestas
# Edita: data/entrenamiento-24-7-completo.json
# Luego: Training24_7Service.reload()
```

## 🚀 Despliegue

```bash
# Build para producción
npm run build

# Iniciar en producción
npm start

# Deploy a Easypanel
git push origin main
# (Easypanel detecta cambios automáticamente)
```

## 📱 WhatsApp

```bash
# Conectar WhatsApp
# 1. Ve a http://localhost:3000
# 2. Click en "Conectar WhatsApp"
# 3. Escanea QR

# Desconectar WhatsApp
# Dashboard → Disconnect

# Resetear sesión
npx tsx scripts/resetear-whatsapp.bat

# Limpiar sesiones antiguas
npx tsx scripts/limpiar-sesiones.bat
```

## 🔑 API Keys

```bash
# Obtener Groq API Key
# https://console.groq.com/keys

# Verificar API keys
npx tsx scripts/verificar-api-keys.js

# Test de Groq
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"Hola"}]}'
```

## 📊 Estadísticas

```bash
# Ver estadísticas del bot
Bot24_7Orchestrator.getStats()

# Ver estadísticas de entrenamiento
Training24_7Service.getStats()

# Ver métricas de conversaciones
# Dashboard → Analytics
```

## 🎯 Casos de Uso Rápidos

### Agregar nuevo producto con foto

```bash
# 1. Sube foto a public/uploads/products/
# 2. Dashboard → Products → Add Product
# 3. Llena formulario
# 4. Reentrenar:
npx tsx scripts/entrenar-bot-24-7-completo.ts
```

### Cambiar tono de respuestas

```typescript
// src/lib/bot-24-7-orchestrator.ts
// Línea ~80
const tone = 'professional' // o 'casual', 'friendly'
```

### Activar/Desactivar Ollama

```env
# .env
OLLAMA_ENABLED=false  # Solo Groq (más rápido)
OLLAMA_ENABLED=true   # Groq + Ollama (más inteligente)
```

### Ajustar cuándo enviar fotos

```typescript
// src/lib/training-24-7-service.ts
// Línea ~120
const photoIntents = [
  'photo_request',
  'product_info',
  'product_search'
  // Agrega más aquí
]
```

## 🆘 Comandos de Emergencia

```bash
# Bot no responde
Ctrl+C
npm run dev

# WhatsApp desconectado
npx tsx scripts/resetear-whatsapp.bat
npm run dev

# Base de datos corrupta
npm run db:reset
npx tsx scripts/seed.ts

# Todo roto
git stash
git pull origin main
npm install
npm run db:push
npm run dev
```

## 📚 Documentación

```bash
# Ver documentación completa
cat ACTIVAR_BOT_24_7_AHORA.md

# Ver resumen ejecutivo
cat RESUMEN_BOT_24_7_IMPLEMENTADO.md

# Ver guías específicas
ls *.md
```

## 💡 Tips Rápidos

```bash
# Respuestas más rápidas
GROQ_MAX_TOKENS=300

# Respuestas más detalladas
GROQ_MAX_TOKENS=600

# Más fotos automáticas
ENABLE_PHOTO_SENDING=true

# Menos fotos
ENABLE_PHOTO_SENDING=false

# Solo Groq (rápido)
OLLAMA_ENABLED=false

# Groq + Ollama (inteligente)
OLLAMA_ENABLED=true
```

## 🎉 Atajos Útiles

```bash
# Alias útiles (agregar a .bashrc o .zshrc)
alias bot-start="npm run dev"
alias bot-train="npx tsx scripts/entrenar-bot-24-7-completo.ts"
alias bot-test="npx tsx scripts/test-bot-24-7-complete.ts"
alias bot-reset="npx tsx scripts/resetear-whatsapp.bat && npm run dev"
```

## 📞 Ayuda Rápida

```bash
# ¿Bot no responde?
1. Verifica WhatsApp conectado
2. Revisa logs: npm run dev
3. Verifica .env

# ¿Respuestas raras?
1. Reentrenar: npx tsx scripts/entrenar-bot-24-7-completo.ts
2. Verificar productos: npx tsx scripts/ver-productos.ts
3. Revisar logs

# ¿Fotos no se envían?
1. ENABLE_PHOTO_SENDING=true
2. Verificar imágenes: npx tsx scripts/verificar-imagenes-productos.ts
3. Revisar permisos de carpeta public/uploads
```

---

**💡 Tip:** Guarda este archivo en favoritos para acceso rápido a todos los comandos.

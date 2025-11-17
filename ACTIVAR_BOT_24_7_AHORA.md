# 🚀 ACTIVAR BOT 24/7 CON ENTRENAMIENTO COMPLETO

## ✅ Sistema Implementado

El bot ahora cuenta con:

### 🎓 Entrenamiento Completo
- ✅ Groq (Llama 3.1) para respuestas rápidas
- ✅ Ollama (local) para razonamiento profundo
- ✅ Envío automático de fotos
- ✅ Respuestas humanizadas y profesionales
- ✅ Aprendizaje continuo de interacciones

### 🎯 Características Principales

1. **Respuestas Inteligentes**
   - Detecta intención del cliente
   - Usa contexto de conversación
   - Adapta tono según situación

2. **Envío Automático de Fotos**
   - Detecta cuando el cliente quiere ver productos
   - Envía fotos automáticamente
   - Incluye descripción y precio

3. **Multi-Provider IA**
   - Groq: Respuestas rápidas (< 2 segundos)
   - Ollama: Razonamiento profundo (consultas complejas)
   - Fallback automático si uno falla

4. **Tonos de Conversación**
   - **Casual**: Para saludos y consultas generales
   - **Professional**: Para compras y pagos
   - **Friendly**: Para información de productos

## 📋 Pasos para Activar

### 1. Entrenar el Bot

```bash
# Ejecutar entrenamiento completo
npx tsx scripts/entrenar-bot-24-7-completo.ts
```

Esto generará:
- `data/entrenamiento-24-7-completo.json` con todos los ejemplos
- Reporte de entrenamiento con estadísticas

### 2. Verificar Variables de Entorno

Asegúrate de tener en tu `.env`:

```env
# Groq (obligatorio)
GROQ_API_KEY=tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant

# Ollama (opcional, para razonamiento profundo)
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Envío de fotos
ENABLE_PHOTO_SENDING=true
```

### 3. Iniciar el Bot

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

### 4. Conectar WhatsApp

1. Ve al dashboard: http://localhost:3000
2. Haz clic en "Conectar WhatsApp"
3. Escanea el código QR
4. ¡Listo! El bot está activo 24/7

## 🧪 Probar el Bot

### Pruebas Básicas

```bash
# Probar respuestas humanizadas
npx tsx scripts/test-humanized-responses.ts

# Probar envío de fotos
npx tsx scripts/test-photo-sending.ts

# Probar sistema completo
npx tsx scripts/test-bot-24-7-complete.ts
```

### Ejemplos de Conversación

**Cliente:** "Hola, ¿tienes laptops?"
**Bot:** "¡Hola! 😊 Sí, tengo varias opciones de laptops. ¿Qué tipo de laptop buscas? ¿Para trabajo, estudio o gaming?"

**Cliente:** "Para trabajo"
**Bot:** "Perfecto, te recomiendo estas opciones para trabajo:

1️⃣ **Laptop HP 15-dy2795wm**
   💰 $2.500.000 COP
   ⚡ Intel Core i5 - Ideal para multitarea

2️⃣ **Laptop Dell Inspiron 15**
   💰 $2.200.000 COP
   ⚡ AMD Ryzen 5 - Excelente rendimiento

¿Cuál te interesa? Te envío fotos 📸"

**Cliente:** "La HP"
**Bot:** *[Envía foto automáticamente]*
"¡Excelente elección! 🚀 La Laptop HP 15-dy2795wm tiene:

⚡ Intel Core i5 (11ª Gen)
💾 8GB RAM + 256GB SSD
🖥️ Pantalla 15.6\" Full HD
🔋 Hasta 8 horas de batería

💰 Precio: $2.500.000 COP

¿Te gustaría comprarla?"

## 📊 Monitoreo

### Ver Estadísticas

```bash
# Ver estadísticas de entrenamiento
npx tsx scripts/ver-stats-entrenamiento.ts

# Ver métricas del bot
npx tsx scripts/ver-metricas-bot.ts
```

### Dashboard de Métricas

Ve a: http://localhost:3000/dashboard/metrics

Verás:
- Total de conversaciones
- Tasa de respuesta
- Productos más consultados
- Intenciones detectadas
- Fotos enviadas

## 🔧 Configuración Avanzada

### Ajustar Tono del Bot

Edita `src/lib/humanized-response-generator.ts`:

```typescript
// Cambiar tono por defecto
const tone = context.tone || 'professional' // o 'casual', 'friendly'
```

### Ajustar Cuándo Enviar Fotos

Edita `src/lib/training-24-7-service.ts`:

```typescript
static shouldSendPhoto(intent: string, productId?: string): boolean {
  const photoIntents = [
    'photo_request',
    'product_info',
    'product_search',
    'product_details'
  ]
  return photoIntents.includes(intent) && !!productId
}
```

### Ajustar Cuándo Usar Ollama

Edita `src/lib/bot-24-7-orchestrator.ts`:

```typescript
private static shouldUseOllama(intent: string, messageCount: number): boolean {
  // Usar Ollama para consultas complejas
  const complexIntents = [
    'product_comparison',
    'technical_inquiry',
    'complex_question'
  ]
  
  // O después de varios mensajes
  const needsDeepContext = messageCount > 5
  
  return complexIntents.includes(intent) || needsDeepContext
}
```

## 🐛 Solución de Problemas

### El bot no responde

1. Verifica que WhatsApp esté conectado
2. Revisa los logs: `npm run dev`
3. Verifica las API keys en `.env`

### Las fotos no se envían

1. Verifica `ENABLE_PHOTO_SENDING=true` en `.env`
2. Asegúrate de que los productos tengan imágenes
3. Revisa permisos de la carpeta `public/uploads`

### Respuestas muy lentas

1. Usa Groq en lugar de Ollama para respuestas rápidas
2. Reduce `max_tokens` en la configuración
3. Limita el historial de conversación

### Ollama no funciona

1. Verifica que Ollama esté instalado: `ollama --version`
2. Inicia Ollama: `ollama serve`
3. Descarga el modelo: `ollama pull llama3.1:8b`

## 📚 Documentación Adicional

- [Guía de Entrenamiento](./GUIA_ENTRENAMIENTO_BOT.md)
- [Configuración de Fotos](./CONFIGURACION_FOTOS_AUTOMATICAS.md)
- [Personalización de Respuestas](./PERSONALIZACION_RESPUESTAS.md)
- [Métricas y Análisis](./METRICAS_BOT.md)

## 🎯 Próximos Pasos

1. ✅ Entrenar el bot con tus productos
2. ✅ Probar conversaciones reales
3. ✅ Ajustar tonos según tu marca
4. ✅ Monitorear métricas
5. ✅ Iterar y mejorar

## 💡 Tips

- **Entrena regularmente**: Ejecuta el entrenamiento cada vez que agregues productos
- **Monitorea conversaciones**: Revisa qué funciona y qué no
- **Ajusta tonos**: Prueba diferentes tonos para tu audiencia
- **Usa fotos de calidad**: Las fotos mejoran la conversión
- **Responde rápido**: Groq es ideal para respuestas instantáneas

## 🚀 ¡Listo!

Tu bot está entrenado y listo para funcionar 24/7 con:
- ✅ Respuestas humanizadas
- ✅ Envío automático de fotos
- ✅ Inteligencia artificial avanzada
- ✅ Aprendizaje continuo

¡Empieza a vender! 🎉

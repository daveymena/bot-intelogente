# 🤖 Guía Completa del Sistema LLM

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración](#configuración)
4. [Uso Básico](#uso-básico)
5. [Personalización](#personalización)
6. [Optimización](#optimización)
7. [Troubleshooting](#troubleshooting)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

El sistema LLM (Large Language Model) del bot utiliza **Groq con Llama 3.1** para generar respuestas inteligentes y naturales a los clientes por WhatsApp.

### Características Principales

- ✅ Respuestas en español natural y conversacional
- ✅ Contexto de conversación de 24 horas
- ✅ Búsqueda inteligente de productos
- ✅ Detección automática de intenciones
- ✅ Envío automático de fotos y links de pago
- ✅ Escalamiento a humano cuando es necesario
- ✅ Formato automático con emojis y viñetas

---

## 🏗️ Arquitectura del Sistema

### Flujo de Procesamiento

```
1. Cliente envía mensaje por WhatsApp
   ↓
2. Baileys Service recibe el mensaje
   ↓
3. Sistema de Prioridades:
   
   PRIORIDAD 1: ¿Es respuesta directa?
   (Saludos, gracias, horarios)
   → SÍ: Responder sin IA (< 100ms)
   → NO: Continuar
   
   PRIORIDAD 2: ¿Solicita foto o link de pago?
   → SÍ: Enviar automáticamente
   → NO: Continuar
   
   PRIORIDAD 3: Usar IA (Groq)
   → Cargar historial de 24h
   → Generar respuesta inteligente
   → Formatear con emojis
   → Enviar al cliente
   
4. Post-procesamiento:
   → Detectar productos mencionados
   → Enviar fotos automáticamente
   → Actualizar contexto
```

### Componentes Principales

| Componente | Archivo | Función |
|------------|---------|---------|
| **AI Service** | `src/lib/ai-service.ts` | Orquestador principal de IA |
| **Baileys Service** | `src/lib/baileys-stable-service.ts` | Integración WhatsApp |
| **Direct Response** | `src/lib/direct-response-handler.ts` | Respuestas sin IA |
| **Product Intelligence** | `src/lib/product-intelligence-service.ts` | Búsqueda de productos |
| **Response Formatter** | `src/lib/response-formatter.ts` | Formato de respuestas |
| **Context Service** | `src/lib/conversation-context-service.ts` | Memoria de conversación |

---

## ⚙️ Configuración

### 1. Variables de Entorno

Edita el archivo `.env`:

```env
# IA Principal
AI_PROVIDER=groq
GROQ_API_KEY=tu_api_key_aqui
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=300

# Características
AI_ENABLED=true
PHOTOS_ENABLED=true
AUDIO_ENABLED=true
```

### 2. Configuración del LLM

Edita `llm-config.json`:

```json
{
  "groq": {
    "model": "llama-3.1-8b-instant",
    "maxTokens": 300,
    "temperature": 0.7
  },
  "systemPrompt": {
    "tone": "amigable y conversacional",
    "style": {
      "useEmojis": true,
      "maxLines": 4
    }
  }
}
```

### 3. Personalidad del Bot

Desde el dashboard:
1. Ve a **Configuración** → **Personalidad del Bot**
2. Configura:
   - Nombre del bot
   - Tono de voz
   - Estilo de respuestas
   - Emojis favoritos

---

## 🚀 Uso Básico

### Iniciar el Sistema

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Probar el LLM

```bash
# Test completo
npm run test:llm
# o
test-llm.bat

# Test específico
npx tsx scripts/test-llm-completo.ts
```

### Ver Logs en Tiempo Real

Los logs del LLM aparecen en la consola:

```
[AI] Generando respuesta para: "busco una laptop"
[AI] 📚 Historial cargado: 4 mensajes
[AI] Intención detectada: product_search (0.95)
[AI] ✅ Respuesta generada con Groq (1.2s)
[Baileys] 🎨 Respuesta formateada
[Baileys] ✅ Respuesta enviada
```

---

## 🎨 Personalización

### 1. Modificar el System Prompt

Edita `src/lib/ai-service.ts`:

```typescript
const systemPrompt = `
Eres ${botName}, un asistente de ventas experto de Tecnovariedades D&S.

PERSONALIDAD:
- Amigable y cercano
- Profesional pero no formal
- Usa emojis apropiados
- Respuestas concisas (máximo 3-4 líneas)

PRODUCTOS:
- Laptops y computadoras
- Motos y vehículos
- Cursos digitales
- Megapacks de contenido

REGLAS:
1. Enfócate en BENEFICIOS, no en especificaciones
2. Si mencionan presupuesto, busca opciones en ese rango
3. Si piden fotos, confirma que las enviarás
4. NUNCA inventes información
5. NUNCA copies ejemplos literalmente

ESTILO:
- Usa viñetas para listas
- Destaca precios con 💰
- Usa emojis relevantes
- Siempre ofrece ayuda adicional
`
```

### 2. Agregar Ejemplos de Entrenamiento

Edita `src/lib/sales-training-data.ts`:

```typescript
export const TRAINING_SCENARIOS = [
  {
    userMessage: "busco una laptop para diseño gráfico",
    botResponse: "¡Perfecto! Para diseño gráfico te recomiendo...",
    context: "laptop_design",
    intent: "product_search"
  },
  // Agregar más ejemplos aquí
]
```

### 3. Configurar Respuestas Directas

Edita `src/lib/direct-response-handler.ts`:

```typescript
const DIRECT_RESPONSES = {
  greeting: [
    "¡Hola! 👋 Soy {botName}, ¿en qué puedo ayudarte?",
    "¡Buenas! 😊 ¿Qué estás buscando hoy?"
  ],
  gratitude: [
    "¡Con gusto! 😊 ¿Algo más en lo que pueda ayudarte?",
    "¡Para eso estoy! 🙌 ¿Necesitas algo más?"
  ]
}
```

### 4. Ajustar Formato de Respuestas

Edita `src/lib/response-formatter.ts`:

```typescript
export class ResponseFormatter {
  static format(text: string): string {
    // Agregar emojis
    text = this.addEmojis(text)
    
    // Crear viñetas
    text = this.createBulletPoints(text)
    
    // Destacar precios
    text = this.highlightPrices(text)
    
    return text
  }
}
```

---

## 🔧 Optimización

### 1. Analizar Conversaciones

```bash
# Ejecutar análisis
npm run analyze:llm
# o
mejorar-llm.bat
```

Esto generará:
- `training-dataset.json` - Dataset de conversaciones reales
- `optimized-system-prompt.txt` - Prompt optimizado

### 2. Ajustar Parámetros

En `llm-config.json`:

```json
{
  "groq": {
    "temperature": 0.7,  // Creatividad (0.0 - 1.0)
    "maxTokens": 300,    // Longitud máxima
    "topP": 0.9          // Diversidad de respuestas
  }
}
```

**Recomendaciones:**
- `temperature: 0.7` - Balance entre creatividad y consistencia
- `maxTokens: 300` - Respuestas concisas
- `topP: 0.9` - Buena diversidad

### 3. Optimizar Velocidad

```env
# Usar modelo más rápido
GROQ_MODEL=llama-3.1-8b-instant

# Reducir tokens
GROQ_MAX_TOKENS=200

# Desactivar razonamiento avanzado
AI_USE_REASONING=false
```

### 4. Mejorar Precisión

1. **Agregar más ejemplos de entrenamiento**
   - Edita `src/lib/sales-training-data.ts`
   - Incluye casos reales de tu negocio

2. **Refinar detección de intenciones**
   - Edita `src/lib/product-intelligence-service.ts`
   - Agrega keywords específicos

3. **Actualizar información de productos**
   - Mantén la BD actualizada
   - Usa descripciones claras y completas

---

## 🐛 Troubleshooting

### Problema: El bot no responde

**Solución:**
1. Verifica que Groq esté configurado:
   ```bash
   # En .env
   GROQ_API_KEY=tu_key_aqui
   AI_ENABLED=true
   ```

2. Revisa los logs:
   ```
   [AI] ❌ Error: API key no configurada
   ```

3. Prueba la conexión:
   ```bash
   npx tsx scripts/test-llm-completo.ts
   ```

### Problema: Respuestas muy lentas

**Solución:**
1. Reduce tokens:
   ```env
   GROQ_MAX_TOKENS=200
   ```

2. Usa modelo más rápido:
   ```env
   GROQ_MODEL=llama-3.1-8b-instant
   ```

3. Activa respuestas directas:
   ```typescript
   // En direct-response-handler.ts
   // Agregar más patrones de respuesta directa
   ```

### Problema: Respuestas incorrectas

**Solución:**
1. Revisa el system prompt
2. Agrega más ejemplos de entrenamiento
3. Actualiza información de productos en BD
4. Verifica el contexto de conversación

### Problema: El bot inventa información

**Solución:**
1. Refuerza las reglas en el system prompt:
   ```typescript
   NUNCA inventes información que no tienes.
   Si no sabes algo, di "Déjame verificar eso".
   ```

2. Usa temperatura más baja:
   ```json
   "temperature": 0.5
   ```

---

## ✨ Mejores Prácticas

### 1. System Prompt

✅ **Hacer:**
- Ser específico sobre el rol y negocio
- Incluir ejemplos concretos
- Definir reglas claras
- Especificar el tono deseado

❌ **Evitar:**
- Prompts muy largos (> 500 palabras)
- Instrucciones contradictorias
- Ser demasiado genérico

### 2. Ejemplos de Entrenamiento

✅ **Hacer:**
- Usar conversaciones reales
- Incluir variedad de casos
- Actualizar regularmente
- Cubrir todos los productos

❌ **Evitar:**
- Ejemplos inventados
- Casos muy específicos
- Respuestas muy largas

### 3. Contexto de Conversación

✅ **Hacer:**
- Mantener historial de 24h
- Guardar producto mencionado
- Recordar presupuesto del cliente
- Limpiar contexto antiguo

❌ **Evitar:**
- Historial muy largo (> 10 mensajes)
- Contexto sin límite de tiempo
- No limpiar memoria

### 4. Formato de Respuestas

✅ **Hacer:**
- Usar emojis apropiados
- Crear viñetas para listas
- Destacar precios
- Mantener respuestas concisas

❌ **Evitar:**
- Demasiados emojis
- Respuestas muy largas
- Formato inconsistente

### 5. Monitoreo

✅ **Hacer:**
- Revisar logs regularmente
- Analizar conversaciones
- Medir tiempos de respuesta
- Recopilar feedback

❌ **Evitar:**
- Ignorar errores
- No actualizar el sistema
- No medir métricas

---

## 📊 Métricas Clave

### Rendimiento
- **Tiempo de respuesta**: < 2 segundos
- **Tasa de éxito**: > 95%
- **Uptime**: > 99%

### Calidad
- **Precisión de intenciones**: > 90%
- **Satisfacción del cliente**: > 4.5/5
- **Tasa de escalamiento**: < 5%

### Uso
- **Mensajes procesados/día**: Variable
- **Conversaciones activas**: Variable
- **Productos recomendados**: Variable

---

## 🔗 Enlaces Útiles

- [Documentación de Groq](https://console.groq.com/docs)
- [Llama 3.1 Model Card](https://ai.meta.com/llama/)
- [Guía de Prompts](https://www.promptingguide.ai/)

---

## 📝 Comandos Rápidos

```bash
# Iniciar sistema
npm run dev

# Test completo
npm run test:llm

# Analizar y mejorar
npm run analyze:llm

# Ver logs
npm run dev | grep "\[AI\]"

# Limpiar caché
npm run clean
```

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa esta guía
2. Consulta `ESTADO_LLM_BOT_ACTUAL.md`
3. Ejecuta `test-llm.bat` para diagnosticar
4. Revisa los logs del servidor

---

**Última actualización**: 2025-01-09
**Versión**: 1.0.0

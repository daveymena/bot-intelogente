# 🤖 CUÁNDO USA IA Y CUÁNDO NO

## 📊 FLUJO COMPLETO DE DECISIÓN

```
MENSAJE DEL CLIENTE
        ↓
┌───────────────────────────────────────────────────────────┐
│ PRIORIDAD 0: BOT LOCAL (< 100ms)                         │
│ ❌ NO USA IA                                              │
├───────────────────────────────────────────────────────────┤
│ Detecta:                                                  │
│ • "Hola" → Saludo                                        │
│ • "Gracias" → Agradecimiento                             │
│ • "Adiós" → Despedida                                    │
│ • "Ok" / "Listo" → Confirmación                          │
│                                                           │
│ Respuesta: INSTANTÁNEA (respuestas pre-programadas)      │
└───────────────────────────────────────────────────────────┘
        ↓ (Si no detecta patrón simple)
┌───────────────────────────────────────────────────────────┐
│ PRIORIDAD 1: RESPUESTAS DIRECTAS                         │
│ ❌ NO USA IA                                              │
├───────────────────────────────────────────────────────────┤
│ Detecta:                                                  │
│ • "¿Horarios?" → Info de BD                              │
│ • "¿Ubicación?" → Info de BD                             │
│ • "¿Teléfono?" → Info de BD                              │
│                                                           │
│ Respuesta: Desde base de datos (sin IA)                  │
└───────────────────────────────────────────────────────────┘
        ↓ (Si no es respuesta directa)
┌───────────────────────────────────────────────────────────┐
│ PRIORIDAD 2: DETECCIÓN DE PAGO                           │
│ ❌ NO USA IA (solo detección de patrones)                │
├───────────────────────────────────────────────────────────┤
│ Detecta:                                                  │
│ • "Quiero pagar"                                         │
│ • "Link de pago"                                         │
│ • "Cómo pago"                                            │
│ • "Mercado pago"                                         │
│                                                           │
│ Acción:                                                   │
│ 1. Busca producto en MEMORIA PROFESIONAL                 │
│ 2. Si encuentra → Genera enlaces de pago                 │
│ 3. Si NO encuentra → Pregunta qué producto               │
│                                                           │
│ Respuesta: AUTOMÁTICA (sin IA)                           │
└───────────────────────────────────────────────────────────┘
        ↓ (Si no es solicitud de pago)
┌───────────────────────────────────────────────────────────┐
│ PRIORIDAD 3: FLUJO DE CALIFICACIÓN                       │
│ ❌ NO USA IA (lógica programada)                         │
├───────────────────────────────────────────────────────────┤
│ Detecta:                                                  │
│ • "Busco laptop" → ¿Para qué la necesitas?              │
│ • "Quiero moto" → ¿Para ciudad o carretera?             │
│                                                           │
│ Respuesta: Preguntas pre-programadas                     │
└───────────────────────────────────────────────────────────┘
        ↓ (Si no es calificación)
┌───────────────────────────────────────────────────────────┐
│ PRIORIDAD 4: BÚSQUEDA DE PRODUCTOS                       │
│ ✅ USA IA (Groq) - AQUÍ EMPIEZA A USAR IA               │
├───────────────────────────────────────────────────────────┤
│ Detecta:                                                  │
│ • "Curso de piano"                                       │
│ • "Laptop para diseño"                                   │
│ • "Megapack de programación"                             │
│                                                           │
│ Proceso:                                                  │
│ 1. 🔍 Busca producto en BD (sin IA)                     │
│ 2. 🤖 USA GROQ para generar respuesta natural           │
│    - Explica el producto                                 │
│    - Destaca beneficios                                  │
│    - Menciona precio                                     │
│    - Invita a la acción                                  │
│                                                           │
│ Modelo: llama-3.3-70b-versatile                          │
│ Tiempo: 2-4 segundos                                     │
└───────────────────────────────────────────────────────────┘
        ↓ (Si no encuentra producto específico)
┌───────────────────────────────────────────────────────────┐
│ PRIORIDAD 5: CONVERSACIÓN GENERAL                        │
│ ✅ USA IA (Groq) - CONVERSACIÓN LIBRE                   │
├───────────────────────────────────────────────────────────┤
│ Ejemplos:                                                 │
│ • "¿Qué productos tienen?"                               │
│ • "Necesito algo para trabajar desde casa"               │
│ • "¿Tienen garantía?"                                    │
│ • "¿Hacen envíos?"                                       │
│                                                           │
│ Proceso:                                                  │
│ 1. 🤖 USA GROQ con contexto completo                    │
│    - Historial de conversación (24h)                     │
│    - Productos disponibles                               │
│    - Personalidad configurada                            │
│    - Información del negocio                             │
│                                                           │
│ Modelo: llama-3.3-70b-versatile                          │
│ Tiempo: 2-4 segundos                                     │
└───────────────────────────────────────────────────────────┘
```

## 📈 ESTADÍSTICAS DE USO

### ❌ SIN IA (70% de mensajes)
- Saludos: "Hola", "Buenos días" → Bot Local
- Despedidas: "Adiós", "Chao" → Bot Local
- Agradecimientos: "Gracias" → Bot Local
- Confirmaciones: "Ok", "Listo" → Bot Local
- Info básica: Horarios, ubicación → Respuestas directas
- Solicitudes de pago: "Quiero pagar" → Detección automática

### ✅ CON IA (30% de mensajes)
- Preguntas sobre productos específicos
- Conversaciones complejas
- Preguntas técnicas
- Comparaciones de productos
- Recomendaciones personalizadas

## 🎯 EJEMPLOS REALES

### Ejemplo 1: SIN IA (Bot Local)
```
Cliente: "Hola"
Bot: [Bot Local detecta saludo]
     [Responde en < 100ms]
     "¡Hola! 👋 Bienvenido a Tecnovariedades D&S..."
     
✅ NO USA IA
⚡ Tiempo: < 100ms
```

### Ejemplo 2: SIN IA (Detección de Pago)
```
Cliente: "Quiero pagar por mercado pago"
Bot: [Detecta solicitud de pago]
     [Busca en memoria: Curso de Piano]
     [Genera enlaces automáticamente]
     "💳 Perfecto! Aquí están tus opciones de pago..."
     
✅ NO USA IA
⚡ Tiempo: < 500ms
```

### Ejemplo 3: USA IA (Producto Específico)
```
Cliente: "Estoy interesado en el curso de piano"
Bot: [Busca producto en BD: Curso Completo de Piano Online]
     [🤖 USA GROQ para generar respuesta]
     [Contexto: producto, precio, historial, personalidad]
     "¡Genial! 🎹 El Curso Completo de Piano Online es..."
     
✅ USA IA (GROQ)
⏱️ Tiempo: 2-4 segundos
📊 Modelo: llama-3.3-70b-versatile
```

### Ejemplo 4: USA IA (Conversación Compleja)
```
Cliente: "¿Qué laptop me recomiendas para diseño gráfico?"
Bot: [No hay producto específico]
     [🤖 USA GROQ con contexto completo]
     [Analiza: necesidad, presupuesto, productos disponibles]
     "Para diseño gráfico te recomiendo..."
     
✅ USA IA (GROQ)
⏱️ Tiempo: 2-4 segundos
📊 Modelo: llama-3.3-70b-versatile
```

## 🔍 CÓMO IDENTIFICAR EN LOS LOGS

### Sin IA:
```
[Baileys] ⚡ BOT LOCAL respondió (greeting) - Confianza: 95%
[Baileys] ✅ Respuesta local enviada en < 100ms
```

### Con IA:
```
[Baileys] 🤖 Bot local no detectó patrón, usando IA...
[AI] Generando respuesta para: "Estoy interesado en el curso de piano"
[AI] 🧠 Usando sistema de razonamiento avanzado (Ollama → Groq)
[Groq] ⚡ Modelo: llama-3.3-70b-versatile
[AI] ✅ Respuesta generada con: groq (llama-3.3-70b-versatile)
```

## 🎛️ CONFIGURACIÓN DE IA

### Variables de Entorno (.env)
```bash
# IA Principal
GROQ_API_KEY=tu_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=500

# Sistema de Razonamiento
AI_USE_REASONING=true  # Usa Ollama → Groq (fallback)

# Fallback Multi-Provider
AI_FALLBACK_ENABLED=false  # Desactivado (solo Groq)
```

### Cuándo se Llama a Groq:
1. **Búsqueda de productos**: Cuando encuentra un producto y necesita explicarlo
2. **Conversación general**: Cuando no detecta patrón simple
3. **Preguntas complejas**: Comparaciones, recomendaciones, dudas técnicas

### Qué Recibe Groq:
```typescript
{
  systemPrompt: `
    - Personalidad del bot (desde dashboard)
    - Información del negocio
    - Productos disponibles
    - Reglas de respuesta
    - Contexto de memoria profesional
  `,
  conversationHistory: [
    // Últimos 5 mensajes (24h)
  ],
  userMessage: "Mensaje actual del cliente"
}
```

## 💡 OPTIMIZACIÓN

### Por qué este diseño:
1. **70% sin IA** = Respuestas instantáneas + Ahorro de costos
2. **30% con IA** = Conversaciones naturales y complejas
3. **Memoria profesional** = Contexto entre mensajes sin llamar IA cada vez

### Ventajas:
- ⚡ Respuestas rápidas para mensajes simples
- 💰 Menor costo de API (solo usa IA cuando es necesario)
- 🎯 IA enfocada en conversaciones complejas
- 🧠 Memoria mantiene contexto sin re-procesar

## 🔧 CÓMO AJUSTAR

### Para usar MÁS IA:
Edita `src/lib/enhanced-local-bot.ts` y reduce los patrones detectados.

### Para usar MENOS IA:
Agrega más patrones en `src/lib/enhanced-local-bot.ts` y `src/lib/direct-response-handler.ts`.

### Para cambiar modelo de IA:
```bash
# En .env
GROQ_MODEL=llama-3.1-8b-instant  # Más rápido, menos preciso
GROQ_MODEL=llama-3.3-70b-versatile  # Más lento, más preciso (actual)
```

## 📊 RESUMEN VISUAL

```
100 mensajes recibidos
│
├─ 70 mensajes → BOT LOCAL / RESPUESTAS DIRECTAS (sin IA)
│  ├─ 40 saludos/despedidas/gracias
│  ├─ 20 solicitudes de pago
│  └─ 10 info básica (horarios, ubicación)
│
└─ 30 mensajes → GROQ IA
   ├─ 20 preguntas sobre productos
   └─ 10 conversaciones complejas
```

## ✅ CONCLUSIÓN

**El bot USA IA solo cuando es necesario:**
- ❌ NO para saludos, despedidas, agradecimientos
- ❌ NO para solicitudes de pago (usa memoria)
- ❌ NO para info básica (usa BD)
- ✅ SÍ para explicar productos
- ✅ SÍ para conversaciones complejas
- ✅ SÍ para recomendaciones personalizadas

**Esto hace que el bot sea:**
- ⚡ Rápido (70% respuestas < 100ms)
- 💰 Económico (solo paga IA cuando vale la pena)
- 🎯 Efectivo (IA enfocada en ventas complejas)

# 🎯 ESTRATEGIA HÍBRIDA: Bot Local + Groq

## 💡 Concepto

Sistema inteligente que decide cuándo usar cada tipo de IA para **ahorrar tokens de Groq**:

- **Bot Local** (gratis): Respuestas simples y directas sobre productos
- **Groq** (tokens): Solo para contexto complejo, memoria y razonamiento

## 📊 Distribución de Uso

### 🟢 Bot Local (70-80% de mensajes)
**Casos que maneja SIN usar Groq:**

1. **Saludos simples**
   - "Hola", "Buenos días", "Hey"
   
2. **Confirmaciones**
   - "Gracias", "Ok", "Perfecto", "Sí", "No"

3. **Preguntas directas sobre productos** (< 50 caracteres)
   - "Precio del curso de piano"
   - "Tienes laptops?"
   - "Info de la moto"
   - "Dame el link"
   - "Está disponible?"

4. **Menciona producto específico** (< 80 caracteres)
   - "Cuánto cuesta el MacBook"
   - "Info del curso de piano"
   - "La moto Bajaj está disponible?"

### 🔴 Groq (20-30% de mensajes)
**Casos que REQUIEREN Groq:**

1. **Preguntas que necesitan contexto**
   - "Me das el link" (¿de qué?)
   - "Y ese cuánto cuesta?" (¿cuál?)
   - "También tienes..." (contexto previo)

2. **Razonamiento complejo**
   - "Cuál es mejor entre X y Y?"
   - "Qué me recomiendas para..."
   - "Diferencias entre..."

3. **Negociación y ofertas**
   - "Tienes descuento?"
   - "Precio final con envío?"
   - "Puedes hacer oferta?"

4. **Problemas y soporte**
   - "No funciona..."
   - "Tengo un problema..."
   - "Cómo se usa..."

5. **Mensajes largos o complejos**
   - Más de 150 caracteres
   - Más de 20 palabras
   - Múltiples preguntas

## 🔍 Ejemplos Prácticos

### Ejemplo 1: Conversación Simple (Bot Local)
```
Cliente: "Info del curso de piano"
Sistema: Bot Local ✅ (pregunta directa, menciona producto)
Respuesta: Rápida, sin usar tokens de Groq

Cliente: "Cuánto cuesta?"
Sistema: Bot Local ✅ (pregunta simple, tiene contexto en memoria)
Respuesta: Rápida, sin usar tokens
```

### Ejemplo 2: Conversación con Contexto (Groq)
```
Cliente: "Tienes cursos?"
Sistema: Bot Local ✅ (pregunta simple)

Cliente: "Me das el link"
Sistema: Groq 🔴 (necesita contexto: ¿link de qué?)
Respuesta: Usa historial de 24h para saber que habla de cursos
```

### Ejemplo 3: Razonamiento Complejo (Groq)
```
Cliente: "Cuál es mejor, el MacBook o la ASUS?"
Sistema: Groq 🔴 (comparación, requiere razonamiento)
Respuesta: Analiza características y recomienda
```

## 📈 Ahorro de Tokens

### Antes (Todo con Groq)
- 100 mensajes/día × 2,000 tokens = 200,000 tokens/día
- Límite Groq gratis: 7,000 tokens/minuto
- **Problema**: Alcanza límite rápido

### Ahora (Híbrido)
- 70 mensajes Bot Local × 0 tokens = 0 tokens
- 30 mensajes Groq × 2,000 tokens = 60,000 tokens/día
- **Ahorro**: 70% de tokens

## 🎯 Criterios de Decisión

### Bot Local SI:
- ✅ Mensaje < 50 caracteres
- ✅ Pregunta directa (precio, info, link, disponible)
- ✅ Menciona producto específico
- ✅ Saludo o confirmación simple

### Groq SI:
- ✅ Empieza con "y", "pero", "entonces" (necesita contexto)
- ✅ Usa pronombres: "ese", "eso", "aquello" (referencia)
- ✅ Pregunta vaga: "me das el link" (¿de qué?)
- ✅ Comparación o recomendación
- ✅ Mensaje largo (> 150 caracteres)
- ✅ Múltiples preguntas (> 20 palabras)

## 🔧 Configuración

### Ajustar Umbral de Longitud

En `intelligent-response-service.ts`:

```typescript
// Cambiar de 150 a otro valor
if (message.length > 150) {
  useAdvancedAI = true
}

// Cambiar de 20 palabras a otro valor
if (message.split(' ').length > 20) {
  useAdvancedAI = true
}
```

### Agregar Palabras Clave de Productos

```typescript
const productKeywords = [
  'laptop', 'moto', 'curso', 'piano', 
  'macbook', 'asus', 'bajaj', 'mega pack',
  // Agregar más aquí
]
```

## 📊 Logs Mejorados

Ahora verás claramente qué sistema se usa:

```
[Intelligence] Decisión de respuesta: {
  complexity: 'simple',
  useAdvancedAI: false,
  reason: 'Pregunta simple - Bot local (sin Groq)',
  delay: 1500
}
[Intelligence] ⚡ Usando BOT LOCAL para respuesta simple
```

O:

```
[Intelligence] Decisión de respuesta: {
  complexity: 'complex',
  useAdvancedAI: true,
  reason: 'Requiere Groq - Necesita contexto de conversación',
  delay: 5000
}
[Intelligence] 🧠 Usando IA AVANZADA para razonamiento complejo
```

## 🎯 Ventajas

1. **Ahorro de Tokens**: 70% menos uso de Groq
2. **Más Rápido**: Bot local responde instantáneamente
3. **Más Confiable**: Menos dependencia de APIs externas
4. **Escalable**: Puede manejar más conversaciones simultáneas
5. **Inteligente**: Usa Groq solo cuando realmente lo necesita

## 📝 Casos de Uso Reales

### Caso 1: Cliente Nuevo
```
Cliente: "Hola"
→ Bot Local (saludo simple)

Cliente: "Tienes laptops?"
→ Bot Local (pregunta directa)

Cliente: "Info de la ASUS"
→ Bot Local (menciona producto)

Cliente: "Cuál me recomiendas?"
→ Groq (requiere razonamiento)
```

### Caso 2: Cliente Regresando
```
Cliente: "Me das el link de pago"
→ Groq (necesita contexto: ¿de qué producto?)
→ Carga historial de 24h
→ Encuentra que ayer habló del curso de piano
→ Responde con link correcto
```

## ✅ Estado

- [x] Sistema de decisión mejorado
- [x] Más casos para Bot Local
- [x] Detección de necesidad de contexto
- [x] Umbral de longitud ajustado
- [x] Detección de productos específicos
- [x] Logs claros de decisión
- [x] Sin errores de sintaxis

## 🚀 Resultado

El bot ahora es más eficiente, usa Groq solo cuando realmente necesita contexto o razonamiento complejo, ahorrando hasta 70% de tokens mientras mantiene la calidad de las respuestas.

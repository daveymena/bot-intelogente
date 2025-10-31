# 💡 Ejemplos de Uso: Sistema Multi-Provider

## 🎯 Escenarios Reales

### Escenario 1: Todo Funciona Normal

**Situación**: Groq está funcionando perfectamente

```
Cliente: "Hola, ¿tienes laptops?"

[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ✅ Éxito con: groq
[AI] ✅ Respuesta generada con: groq (llama-3.1-8b-instant)

Bot: "¡Hola! Sí, tenemos varias laptops disponibles:
1. ASUS VivoBook Ryzen 3: $1.189.000
2. ASUS VivoBook i5: $1.650.000
3. MacBook Pro M4: $9.799.000
¿Cuál te interesa?"
```

**Tiempo de respuesta**: ~500ms ⚡

---

### Escenario 2: Groq Falla, Usa LM Studio

**Situación**: Groq tiene problemas, automáticamente usa LM Studio

```
Cliente: "Info del curso de piano"

[AI Multi-Provider] 🔄 Intentando con: groq
[AI Multi-Provider] ❌ Error con groq: timeout
[AI Multi-Provider] 🔄 Intentando con: lmstudio
[AI Multi-Provider] ✅ Éxito con: lmstudio
[AI] ✅ Respuesta generada con: lmstudio (phi-2)

Bot: "🎹 Curso Piano Profesional Completo

✅ +80 lecciones en video HD
✅ Acceso de por vida
✅ Soporte directo del profesor
💰 $60.000 COP

¿Te gustaría comprarlo?"
```

**Tiempo de respuesta**: ~2s (local, sin internet)

---

### Escenario 3: Sin Internet, Solo LM Studio

**Situación**: No hay internet, pero LM Studio funciona local

```env
# Configuración para trabajar offline
AI_FALLBACK_ORDER=lmstudio,groq
```

```
Cliente: "Cuánto cuesta la moto?"

[AI Multi-Provider] 🔄 Intentando con: lmstudio
[AI Multi-Provider] ✅ Éxito con: lmstudio
[AI] ✅ Respuesta generada con: lmstudio (phi-2)

Bot: "🏍️ Moto Bajaj Pulsar NS 160

💰 Precio: $8.500.000 COP

✅ Motor 160cc
✅ Frenos ABS
✅ Tablero digital
✅ Garantía 2 años

¿Te interesa? Puedo darte más detalles."
```

**Ventaja**: Funciona sin internet ✅

---

### Escenario 4: Máxima Calidad con OpenAI

**Situación**: Quieres la mejor calidad posible

```env
# Configuración para máxima calidad
AI_FALLBACK_ORDER=openai,groq,lmstudio
OPENAI_API_KEY=tu_key_aqui
```

```
Cliente: "Explícame las diferencias entre las laptops"

[AI Multi-Provider] 🔄 Intentando con: openai
[AI Multi-Provider] ✅ Éxito con: openai
[AI] ✅ Respuesta generada con: openai (gpt-3.5-turbo)

Bot: "¡Claro! Te explico las diferencias principales:

💻 ASUS VivoBook Ryzen 3 ($1.189.000):
- Ideal para: Trabajo básico, estudio, navegación
- Procesador: AMD Ryzen 3 (eficiente)
- RAM: 8GB (suficiente para multitarea ligera)
- Mejor para: Estudiantes, uso diario

💻 ASUS VivoBook i5 ($1.650.000):
- Ideal para: Trabajo profesional, diseño ligero
- Procesador: Intel i5 (más potente)
- RAM: 16GB (multitarea avanzada)
- Mejor para: Profesionales, programadores

💻 MacBook Pro M4 ($9.799.000):
- Ideal para: Diseño profesional, video, desarrollo
- Procesador: Apple M4 (ultra potente)
- RAM: 32GB (máximo rendimiento)
- Mejor para: Creativos, profesionales exigentes

¿Cuál se ajusta mejor a tus necesidades?"
```

**Ventaja**: Respuestas más detalladas y contextuales

---

## 🔧 Configuraciones Recomendadas

### Para Máxima Velocidad

```env
AI_FALLBACK_ORDER=groq,lmstudio
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT=5000
```

**Resultado**: Respuestas en ~500ms

---

### Para Máxima Confiabilidad

```env
AI_FALLBACK_ORDER=groq,lmstudio,openai
AI_FALLBACK_ENABLED=true
```

**Resultado**: Nunca falla, siempre hay respaldo

---

### Para Trabajar Offline

```env
AI_FALLBACK_ORDER=lmstudio
LM_STUDIO_MODEL=phi-2
```

**Resultado**: Funciona sin internet

---

### Para Máxima Calidad

```env
AI_FALLBACK_ORDER=openai,groq,lmstudio
OPENAI_MODEL=gpt-4
```

**Resultado**: Respuestas más inteligentes (pero más caro)

---

## 📊 Comparación de Respuestas

### Pregunta: "¿Tienes laptops?"

#### Groq (llama-3.1-8b-instant)
```
¡Hola! Sí, tenemos laptops disponibles:
1. ASUS VivoBook Ryzen 3: $1.189.000
2. ASUS VivoBook i5: $1.650.000
3. MacBook Pro M4: $9.799.000
¿Cuál te interesa?
```
- Velocidad: ⚡⚡⚡
- Calidad: ⭐⭐⭐
- Costo: 🆓

#### LM Studio (phi-2)
```
Sí, tenemos laptops. Estas son las opciones:
- ASUS VivoBook Ryzen 3 por $1.189.000
- ASUS VivoBook i5 por $1.650.000
- MacBook Pro M4 por $9.799.000
¿Te gustaría saber más de alguna?
```
- Velocidad: ⚡⚡
- Calidad: ⭐⭐⭐
- Costo: 🆓

#### OpenAI (gpt-3.5-turbo)
```
¡Por supuesto! Tenemos excelentes opciones en laptops:

💻 ASUS VivoBook Ryzen 3 - $1.189.000
Perfecta para estudiantes y trabajo básico

💻 ASUS VivoBook i5 - $1.650.000
Ideal para profesionales y multitarea

💻 MacBook Pro M4 - $9.799.000
La mejor opción para creativos y desarrollo

¿Qué tipo de uso le darías? Así puedo recomendarte mejor.
```
- Velocidad: ⚡
- Calidad: ⭐⭐⭐⭐⭐
- Costo: 💰

---

## 🎮 Casos de Uso Específicos

### Caso 1: Tienda con Alto Tráfico

**Necesidad**: Respuestas rápidas, muchos clientes

**Configuración**:
```env
AI_FALLBACK_ORDER=groq,lmstudio
GROQ_MODEL=llama-3.1-8b-instant
GROQ_MAX_TOKENS=300
```

**Resultado**: 
- Respuestas en ~500ms
- Respaldo local si Groq se satura
- Sin límites con LM Studio

---

### Caso 2: Consultoría Premium

**Necesidad**: Máxima calidad en respuestas

**Configuración**:
```env
AI_FALLBACK_ORDER=openai,groq,lmstudio
OPENAI_MODEL=gpt-4
```

**Resultado**:
- Respuestas muy detalladas
- Mejor comprensión del contexto
- Respaldo si OpenAI falla

---

### Caso 3: Trabajo en Zona Rural

**Necesidad**: Internet inestable

**Configuración**:
```env
AI_FALLBACK_ORDER=lmstudio,groq
LM_STUDIO_MODEL=llama-3.2-3b
```

**Resultado**:
- Funciona sin internet
- Usa Groq cuando hay conexión
- Nunca se queda sin servicio

---

### Caso 4: Startup con Presupuesto Limitado

**Necesidad**: Cero costos

**Configuración**:
```env
AI_FALLBACK_ORDER=groq,lmstudio
# Sin OpenAI
```

**Resultado**:
- 100% gratis
- Groq rápido y confiable
- LM Studio sin límites

---

## 🧪 Pruebas Reales

### Prueba 1: Velocidad

```bash
# Ejecutar 10 veces y medir tiempo
for i in {1..10}; do
  time npx tsx scripts/test-multi-provider.ts
done
```

**Resultados esperados**:
- Groq: ~500ms
- LM Studio: ~2s
- OpenAI: ~1.5s

---

### Prueba 2: Confiabilidad

```bash
# Simular fallo de Groq
# (desconectar internet temporalmente)
npx tsx scripts/test-multi-provider.ts
```

**Resultado esperado**:
```
[AI Multi-Provider] ❌ Error con groq: fetch failed
[AI Multi-Provider] ✅ Éxito con: lmstudio
```

---

### Prueba 3: Calidad

Enviar la misma pregunta a los 3 providers y comparar:

```typescript
// Pregunta: "Explícame las ventajas del curso de piano"

// Groq: Respuesta concisa y directa
// LM Studio: Respuesta clara y estructurada
// OpenAI: Respuesta detallada y persuasiva
```

---

## 💡 Tips Avanzados

### Tip 1: Usar Diferentes Modelos por Intención

```typescript
// Para consultas simples: phi-2 (rápido)
// Para consultas complejas: llama-3.3-70b (mejor)

if (intent === 'price_inquiry') {
  model = 'phi-2' // Rápido
} else if (intent === 'information_request') {
  model = 'llama-3.3-70b' // Detallado
}
```

---

### Tip 2: Cachear Respuestas Comunes

```typescript
// Guardar respuestas frecuentes
const cache = {
  "¿tienes laptops?": "respuesta_cacheada",
  "horarios": "respuesta_cacheada"
}

// Usar cache primero, IA después
```

---

### Tip 3: Monitorear Uso

```typescript
// Contar cuántas veces usa cada provider
const stats = {
  groq: 0,
  lmstudio: 0,
  openai: 0
}

// Analizar y optimizar
```

---

## 🎯 Resultado Final

Con este sistema tienes:

✅ **3 opciones de IA** (Groq, LM Studio, OpenAI)
✅ **Fallback automático** en milisegundos
✅ **Funciona offline** con LM Studio
✅ **Cero costos** con Groq + LM Studio
✅ **Máxima calidad** con OpenAI (opcional)
✅ **Ultra confiable** - nunca falla

---

**¡Tu bot ahora es imparable!** 🚀

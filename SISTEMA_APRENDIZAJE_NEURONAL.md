# 🧠 SISTEMA DE APRENDIZAJE NEURONAL

## ✅ SISTEMA IMPLEMENTADO

El bot ahora tiene un sistema de **aprendizaje continuo** que:

1. ✅ **Usa Groq** para generar respuestas profesionales
2. ✅ **Aprende** de las conversaciones exitosas
3. ✅ **Guarda** las mejores respuestas como "neuronas"
4. ✅ **Actualiza** su base de conocimiento automáticamente
5. ✅ **Mejora** con cada conversación

## 🔄 FLUJO DE APRENDIZAJE

```
Cliente envía mensaje
         ↓
Bot intenta respuesta entrenada
         ↓
Si no encuentra → Usa Groq
         ↓
Groq genera respuesta profesional
  (con emojis, formato, espacios)
         ↓
Bot envía respuesta al cliente
         ↓
Si fue exitosa (confianza > 70%)
         ↓
🧠 GUARDA COMO NEURONA
         ↓
Cada 50 neuronas → Actualiza entrenamiento
         ↓
Bot aprende y mejora
```

## 📊 FORMATO DE GROQ

Groq ahora genera respuestas con formato profesional:

```
¡Claro! 😊 Tengo el *Curso Completo de Piano*

Es un curso profesional con +80 lecciones en video HD.

💰 Precio: $60.000 COP

Características:
✅ Acceso de por vida
✅ Certificado al finalizar
✅ Soporte del profesor

¿Te gustaría saber más?
```

### Reglas de Formato:

- ✅ 2-4 emojis por mensaje (natural, no exagerado)
- ✅ Negritas con *texto*
- ✅ Listas con ✅ o •
- ✅ Saltos de línea entre secciones
- ✅ Precio destacado con 💰
- ✅ Máximo 150 palabras (conciso)

## 🧠 NEURONAS (Base de Conocimiento)

### ¿Qué son las neuronas?

Son conversaciones exitosas guardadas para uso futuro:

```json
{
  "entrada": "¿Tienes curso de piano?",
  "salida": "¡Claro! 😊 Tengo el *Curso Completo de Piano*...",
  "intencion": "product_search",
  "producto_id": "xxx",
  "producto_nombre": "Curso Completo de Piano",
  "confianza": 0.95,
  "fecha_aprendizaje": "2025-11-16T...",
  "fuente": "groq"
}
```

### Cuándo se guarda una neurona:

- ✅ Respuesta generada por Groq
- ✅ Confianza > 70%
- ✅ Conversación exitosa
- ✅ Formato correcto

### Cuándo NO se guarda:

- ❌ Respuesta de fallback genérico
- ❌ Confianza < 70%
- ❌ Error en la conversación

## 📈 PROCESO DE ACTUALIZACIÓN

### Automático (cada 50 neuronas):

```
1. Bot acumula 50 conversaciones exitosas
2. Guarda en data/neural-learning.json
3. Próximo reentrenamiento las incluirá
4. Bot mejora automáticamente
```

### Manual (cuando quieras):

```bash
# Ver estadísticas
npx tsx scripts/ver-aprendizaje-neuronal.ts

# Reentrenar con nuevas neuronas
npx tsx scripts/entrenar-bot-24-7-completo.ts
```

## 🎯 VENTAJAS DEL SISTEMA

### 1. Mejora Continua

- Bot aprende de cada conversación
- Se adapta a tu negocio específico
- Mejora el formato de respuestas
- Aprende nuevas formas de preguntar

### 2. Respuestas Profesionales

- Groq genera respuestas bien formateadas
- Emojis apropiados
- Espacios y saltos de línea correctos
- Formato WhatsApp profesional

### 3. Híbrido Inteligente

- Usa respuestas entrenadas (rápido)
- Usa Groq cuando es necesario (dinámico)
- Aprende de Groq (mejora continua)
- Fallback automático (siempre funciona)

### 4. Sin Límites

- Groq tiene límites, pero...
- Bot aprende y guarda las respuestas
- Próxima vez usa respuesta entrenada
- Reduce uso de Groq con el tiempo

## 📊 ESTADÍSTICAS

### Ver aprendizaje:

```bash
npx tsx scripts/ver-aprendizaje-neuronal.ts
```

**Muestra:**
- Total de neuronas aprendidas
- Última actualización
- Neuronas en cola
- Últimas 5 neuronas
- Estadísticas por intención

### Ejemplo de salida:

```
🧠 ESTADÍSTICAS DE APRENDIZAJE NEURONAL

📊 Resumen:
   Total de neuronas aprendidas: 127
   Última actualización: 2025-11-16 15:30:00
   En cola para procesar: 12

📚 Detalles:
   Versión: 1.0.0
   Total de ejemplos: 127

🎯 Últimas 5 neuronas aprendidas:

   1. Entrada: "¿Tienes curso de piano?"
      Salida: "¡Claro! 😊 Tengo el *Curso Completo de Piano*..."
      Intención: product_search
      Producto: Curso Completo de Piano
      Confianza: 95%
      Fecha: 16/11/2025 15:25:00

📋 Neuronas por intención:
   - product_search: 45 neuronas
   - price_inquiry: 32 neuronas
   - product_info: 28 neuronas
   - payment_request: 22 neuronas
```

## 🔧 CONFIGURACIÓN

### Activar Groq:

```env
# En .env
GROQ_API_KEY=gsk_tu_key_aqui
```

### Ajustar aprendizaje:

```typescript
// En neural-learning-service.ts

// Cambiar cuántas neuronas antes de guardar
private static readonly MAX_QUEUE_SIZE = 50  // Cambiar a 25, 100, etc.

// Cambiar confianza mínima para aprender
if (item.confidence > 0.7)  // Cambiar a 0.8, 0.6, etc.
```

## 🧪 PRUEBAS

### Prueba 1: Conversación con Groq

```bash
# 1. Configura Groq API key
# 2. Reinicia servidor
# 3. Envía mensaje desde WhatsApp
# 4. Groq responde con formato profesional
# 5. Bot guarda como neurona
```

### Prueba 2: Ver aprendizaje

```bash
# Después de varias conversaciones
npx tsx scripts/ver-aprendizaje-neuronal.ts

# Verás las neuronas aprendidas
```

### Prueba 3: Reentrenar

```bash
# Reentrenar con nuevas neuronas
npx tsx scripts/entrenar-bot-24-7-completo.ts

# El bot ahora incluye las neuronas aprendidas
```

## 📁 ARCHIVOS CREADOS

1. **`src/lib/neural-learning-service.ts`**
   - Servicio de aprendizaje neuronal
   - Guarda conversaciones exitosas
   - Procesa cola de aprendizaje

2. **`scripts/ver-aprendizaje-neuronal.ts`**
   - Script para ver estadísticas
   - Muestra neuronas aprendidas
   - Análisis por intención

3. **`data/neural-learning.json`** (se crea automáticamente)
   - Base de conocimiento aprendida
   - Neuronas de Groq
   - Se actualiza automáticamente

## 🎉 RESULTADO

El bot ahora:

1. ✅ **Usa Groq** para respuestas dinámicas
2. ✅ **Aprende** de cada conversación exitosa
3. ✅ **Guarda** las mejores respuestas
4. ✅ **Mejora** continuamente
5. ✅ **Reduce** uso de Groq con el tiempo
6. ✅ **Mantiene** formato profesional
7. ✅ **Funciona** sin Groq (fallback)

## 🚀 PARA ACTIVAR

```bash
# 1. Configura Groq
# En .env:
GROQ_API_KEY=gsk_tu_key_aqui

# 2. Reinicia servidor
Ctrl+C
npm run dev

# 3. Prueba enviando mensajes
# El bot usará Groq y aprenderá automáticamente

# 4. Ver aprendizaje
npx tsx scripts/ver-aprendizaje-neuronal.ts
```

## 💡 TIPS

### Maximizar aprendizaje:

1. Usa Groq para conversaciones nuevas
2. Bot aprende automáticamente
3. Cada 50 conversaciones se guardan
4. Reentrena periódicamente
5. Bot mejora con el tiempo

### Reducir uso de Groq:

1. Bot aprende de Groq
2. Guarda respuestas como neuronas
3. Próxima vez usa neurona (no Groq)
4. Groq solo para casos nuevos
5. Uso de Groq disminuye con el tiempo

---

**🎯 El bot ahora aprende y mejora automáticamente con cada conversación! 🧠**

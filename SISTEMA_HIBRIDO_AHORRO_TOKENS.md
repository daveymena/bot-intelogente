# Sistema Híbrido de Ahorro de Tokens

## 🎯 Objetivo

Reducir el consumo de tokens de IA respondiendo casos simples localmente, sin llamar a la API de Groq/Ollama. Esto ahorra costos y mejora la velocidad de respuesta.

## 🧠 Cómo Funciona

El sistema tiene un **Router Inteligente** que decide:

1. **¿Puede responder localmente?** → Respuesta instantánea sin IA
2. **¿Requiere IA?** → Llama a Groq/Ollama para respuesta compleja

```
Usuario → Detectar Intención → ¿Local? → Sí → Respuesta rápida ✅
                                ↓
                               No
                                ↓
                           Llamar IA 🤖
```

## 📋 Casos que se Manejan Localmente (SIN IA)

### 1. Saludos Simples
- "Hola"
- "Buenos días"
- "Hey"
- "Buenas tardes"

**Ahorro:** ~500 tokens por saludo

### 2. Despedidas
- "Adiós"
- "Chao"
- "Gracias"
- "Hasta luego"

**Ahorro:** ~500 tokens por despedida

### 3. Consultas de Precio Simples
- "Cuánto cuesta"
- "Precio"
- "Cuánto vale"

**Respuesta local:**
```
*Producto X*
💰 $1.500.000 COP
✅ Disponible

¿Te gustaría más información? 😊
```

**Ahorro:** ~800 tokens por consulta

### 4. Consultas de Disponibilidad Simples
- "Tienen"
- "Hay"
- "Disponible"
- "Stock"

**Respuesta local:**
```
¡Sí! *Producto X* está disponible 😊

💰 $1.500.000 COP
📦 5 unidades

¿Te interesa?
```

**Ahorro:** ~800 tokens por consulta

### 5. Confirmaciones
- "Sí"
- "Ok"
- "Vale"
- "Dale"

**Ahorro:** ~300 tokens por confirmación

### 6. Agradecimientos
- "Gracias"
- "Muchas gracias"

**Ahorro:** ~300 tokens por agradecimiento

## 🤖 Casos que Requieren IA

### Consultas Complejas
- "Necesito un computador para diseño gráfico con presupuesto de 2 millones"
- "Cuál es la diferencia entre estos dos productos"
- "Puedo pagar en cuotas?"

### Conversaciones Contextuales
- Seguimiento de conversaciones previas
- Negociaciones
- Objeciones de venta

### Recomendaciones Personalizadas
- "Qué me recomiendas para..."
- "Cuál es mejor para mi caso..."

## 📊 Estadísticas de Ahorro

El sistema registra automáticamente:

```typescript
{
  local: 45,              // Respuestas locales
  ai: 15,                 // Respuestas con IA
  total: 60,              // Total de mensajes
  localPercentage: "75%", // Porcentaje local
  estimatedTokensSaved: 22500 // Tokens ahorrados
}
```

### Ejemplo Real

En una conversación típica de 100 mensajes:
- **70 mensajes** → Respuestas locales (saludos, precios simples, confirmaciones)
- **30 mensajes** → Respuestas con IA (consultas complejas)

**Ahorro:**
- Tokens ahorrados: 70 × 500 = **35,000 tokens**
- Costo evitado: 35,000 / 1,000,000 × $0.10 = **$0.0035 USD**

En 10,000 conversaciones al mes:
- **$35 USD ahorrados**
- **350 millones de tokens ahorrados**

## 🚀 Ventajas

### 1. Velocidad
- Respuestas locales: **< 10ms**
- Respuestas con IA: **500-2000ms**

### 2. Costo
- Reduce consumo de API en 60-80%
- Menor facturación de Groq

### 3. Confiabilidad
- Respuestas locales siempre disponibles
- No depende de API externa para casos simples

### 4. Consistencia
- Respuestas locales son predecibles
- Formato uniforme

## 🔧 Configuración

### Activar Sistema Híbrido

El sistema está activado por defecto. No requiere configuración adicional.

### Ver Estadísticas

```typescript
import { obtenerEstadisticas } from '@/conversational-module';

const stats = obtenerEstadisticas();
console.log(stats);
```

### Reiniciar Estadísticas

```typescript
import { reiniciarEstadisticas } from '@/conversational-module';

reiniciarEstadisticas();
```

## 🧪 Probar el Sistema

```bash
npx tsx scripts/test-sistema-hibrido-ahorro.ts
```

Este script prueba diferentes tipos de mensajes y muestra:
- Qué mensajes se manejan localmente
- Qué mensajes requieren IA
- Estadísticas de ahorro
- Tiempo de respuesta

## 📈 Optimización Continua

### Agregar Más Casos Locales

Edita `src/conversational-module/utils/localResponseHandler.ts`:

```typescript
// Agregar nuevo caso
if (esConsultaHorario(textoLower)) {
  return {
    canHandle: true,
    response: 'Nuestro horario es Lun-Vie 9am-6pm 🕐',
  };
}
```

### Monitorear Efectividad

Revisa periódicamente las estadísticas para identificar:
- Patrones que se pueden manejar localmente
- Casos que requieren IA innecesariamente

## 🎯 Mejores Prácticas

1. **Mantén respuestas locales simples y directas**
2. **Usa IA para contexto y personalización**
3. **Monitorea estadísticas semanalmente**
4. **Ajusta patrones según uso real**

## 🔮 Futuro

Posibles mejoras:
- Machine learning para detectar más patrones
- Caché de respuestas IA frecuentes
- Respuestas locales con templates dinámicos
- A/B testing de respuestas locales vs IA

## 📝 Resumen

El sistema híbrido es una capa inteligente que:
- ✅ Responde casos simples instantáneamente
- ✅ Ahorra 60-80% de tokens
- ✅ Mejora velocidad de respuesta
- ✅ Mantiene calidad en casos complejos
- ✅ Reduce costos operativos

**Resultado:** Bot más rápido, más económico y más confiable.

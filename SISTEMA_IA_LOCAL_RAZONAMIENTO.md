# 🧠 Sistema de IA Local con Razonamiento

## Concepto

Un sistema de **razonamiento basado en reglas** que funciona **completamente local** sin necesidad de tokens de IA externa. Entiende la intención del cliente incluso con errores de ortografía.

## Características

### ✅ Sin Dependencia de IA Externa
- No consume tokens de Groq, OpenAI, Claude, etc.
- Funciona 100% local
- Sin límites de uso
- Sin costos adicionales

### ✅ Corrección Ortográfica Automática
Corrige errores comunes:
- "diseno" → "diseño"
- "grafico" → "gráfico"
- "mega pack" → "megapack"
- "ingles" → "inglés"
- "programacion" → "programación"

### ✅ Detección de Intención
Usa patrones para entender qué busca el cliente:
- "me interesa el curso de diseño grafico" → **Mega Pack 01**
- "tienes curso de ingles" → **Mega Pack 03**
- "quiero el megapack 01" → **Mega Pack 01**
- "mega pack completo" → **Pack Completo 40**

### ✅ Razonamiento Lógico
El sistema **razona** sobre el mensaje:
1. Corrige ortografía
2. Detecta patrones de intención
3. Extrae palabras clave relevantes
4. Genera consulta de búsqueda optimizada
5. Sugiere el producto más probable

## Cómo Funciona

### Ejemplo 1: Mensaje con Errores

```
Usuario: "me interesa el curso de diseno grafico"
↓
[Corrección Ortográfica]
"me interesa el curso de diseño gráfico"
↓
[Detección de Intención]
Patrón detectado: buscar_curso_diseno_grafico
Palabras clave: ["diseño gráfico", "megapack 01"]
Confianza: 90%
↓
[Producto Sugerido]
"Mega Pack 01: Cursos Diseño Gráfico"
```

### Ejemplo 2: Mensaje Truncado

```
Usuario: "tienes curso ingles"
↓
[Corrección Ortográfica]
"tienes curso inglés"
↓
[Detección de Intención]
Patrón detectado: buscar_curso_ingles
Palabras clave: ["inglés", "megapack 03"]
Confianza: 85%
↓
[Producto Sugerido]
"Mega Pack 03: Cursos Inglés"
```

### Ejemplo 3: Variaciones

```
Usuario: "kiero el mega pak 01"
↓
[Corrección Ortográfica]
"quiero el megapack 01"
↓
[Detección de Intención]
Patrón detectado: buscar_megapack_numero
Palabras clave: ["megapack 01"]
Confianza: 95%
↓
[Producto Sugerido]
"Mega Pack 01: Cursos Diseño Gráfico"
```

## Patrones Implementados

### 1. Búsqueda por Número
- "megapack 01", "mega pack 03", "megapak 15"
- Confianza: 95%

### 2. Búsqueda por Tema
- "curso de diseño gráfico" → Mega Pack 01
- "curso de inglés" → Mega Pack 03
- "curso de programación" → Mega Pack 02
- "curso de marketing" → Mega Pack 03/11
- Confianza: 90%

### 3. Búsqueda General
- "tienes curso de..."
- "hay curso de..."
- Confianza: 85%

### 4. Pack Completo
- "megapack completo"
- "todos los megapacks"
- "pack de 40"
- Confianza: 95%

## Integración con el Bot

### Flujo Actual (CON IA Externa)
```
Usuario → Groq AI → Búsqueda → Respuesta
```

### Flujo Mejorado (CON Sistema Local)
```
Usuario → Intent Translator (Local) → Búsqueda Optimizada → Groq AI → Respuesta
                ↓
         Corrección + Intención
```

### Flujo de Respaldo (SIN IA Externa)
```
Usuario → Intent Translator (Local) → Búsqueda Directa → Respuesta Predefinida
```

## Ventajas

1. **Sin Límites**: No consume tokens de IA
2. **Rápido**: Procesamiento instantáneo local
3. **Confiable**: No depende de APIs externas
4. **Económico**: Sin costos adicionales
5. **Escalable**: Fácil agregar más patrones
6. **Inteligente**: Entiende errores y variaciones

## Uso

```typescript
import { IntentTranslatorService } from '@/lib/intent-translator-service';

// Traducir intención
const result = IntentTranslatorService.translateIntent(
  "me interesa el curso de diseno grafico"
);

console.log(result);
// {
//   originalMessage: "me interesa el curso de diseno grafico",
//   correctedMessage: "me interesa el curso de diseño gráfico",
//   detectedIntent: "buscar_curso_diseno_grafico",
//   productKeywords: ["diseño gráfico", "megapack 01"],
//   confidence: 0.9,
//   reasoning: "Patrón detectado: buscar_curso_diseno_grafico"
// }

// Generar consulta de búsqueda
const searchQuery = IntentTranslatorService.generateSearchQuery(result);
// "diseño gráfico megapack 01"

// Obtener producto más probable
const product = IntentTranslatorService.getMostLikelyProduct(result);
// "Mega Pack 01: Cursos Diseño Gráfico"
```

## Próximos Pasos

1. ✅ Sistema creado
2. ⏳ Integrar con el motor de conversación
3. ⏳ Probar con mensajes reales
4. ⏳ Agregar más patrones según necesidad
5. ⏳ Entrenar con conversaciones reales

## Expansión Futura

### Agregar Más Patrones
Fácil agregar nuevos patrones para:
- Más productos
- Más variaciones de escritura
- Más idiomas
- Más intenciones (precio, disponibilidad, etc.)

### Aprendizaje Automático
Guardar conversaciones exitosas para:
- Detectar nuevos patrones
- Mejorar correcciones ortográficas
- Aumentar precisión

---

**Sistema de razonamiento local completamente funcional sin dependencia de IA externa** 🎉

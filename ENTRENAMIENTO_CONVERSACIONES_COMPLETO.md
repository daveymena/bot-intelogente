# 🎓 Sistema de Entrenamiento de Conversaciones Completo

## Objetivo

Entrenar al bot con conversaciones realistas de TODOS los productos y métodos de pago, guardando las respuestas exitosas en la base de conocimiento local. Esto permite que el bot funcione **sin tokens de IA** usando razonamiento local.

## Scripts Disponibles

### 1. 🚀 Entrenamiento Rápido (Recomendado para empezar)

Entrena con 10 productos y flujos esenciales. Ideal para pruebas.

```bash
npx tsx scripts/entrenar-rapido.ts
```

**Características:**
- ⚡ Rápido (5-10 minutos)
- 📦 10 productos
- 💬 2 flujos esenciales
- 💳 2 métodos de pago (MercadoPago, Nequi)
- 🧠 ~40 respuestas guardadas

### 2. 🎓 Entrenamiento Completo

Entrena con TODOS los productos, flujos y métodos de pago.

```bash
npx tsx scripts/entrenar-conversaciones-completas.ts
```

**Características:**
- 🐢 Lento (30-60 minutos)
- 📦 Todos los productos
- 💬 5 flujos de conversación
- 💳 5 métodos de pago
- 🧠 ~500+ respuestas guardadas

### 3. 🧪 Test sin Tokens

Verifica qué tan bien funciona el bot sin tokens de IA.

```bash
npx tsx scripts/test-sin-tokens.ts
```

**Muestra:**
- ✅ Tasa de éxito de respuestas locales
- 🧠 Estadísticas de base de conocimiento
- 📦 Productos con más conocimiento

## Flujos de Conversación Entrenados

### Flujo 1: Directo
```
Cliente: "Curso de piano"
Bot: [Información del producto]

Cliente: "¿Cómo puedo pagar?"
Bot: [Todos los métodos de pago]

Cliente: "MercadoPago"
Bot: [Link de pago específico]
```

### Flujo 2: Por Categoría
```
Cliente: "¿Tienes cursos de música?"
Bot: [Lista de productos]

Cliente: "Curso de piano"
Bot: [Información del producto]

Cliente: "Quiero pagar"
Bot: [Todos los métodos de pago]

Cliente: "Nequi"
Bot: [Información de Nequi]
```

### Flujo 3: Con Precio
```
Cliente: "Curso de piano"
Bot: [Información del producto]

Cliente: "¿Cuánto cuesta?"
Bot: [Precio]

Cliente: "Métodos de pago"
Bot: [Todos los métodos]

Cliente: "MercadoPago"
Bot: [Link de pago]
```

### Flujo 4: Método Directo
```
Cliente: "Curso de piano"
Bot: [Información del producto]

Cliente: "Puedo pagar con Nequi?"
Bot: [Información de Nequi directamente]
```

### Flujo 5: Detallado
```
Cliente: "Curso de piano"
Bot: [Información básica]

Cliente: "Cuéntame más"
Bot: [Información detallada]

Cliente: "Me interesa, cómo pago?"
Bot: [Todos los métodos]

Cliente: "PayPal"
Bot: [Link de PayPal]
```

## Métodos de Pago Entrenados

1. ✅ **MercadoPago** - Link de pago con tarjeta
2. ✅ **Nequi** - Número de transferencia
3. ✅ **Daviplata** - Número de transferencia
4. ✅ **PayPal** - Link de pago internacional
5. ✅ **Transferencia** - Datos bancarios

## Cómo Funciona

### 1. Durante el Entrenamiento

```typescript
// Para cada producto
for (const product of products) {
  // Para cada flujo de conversación
  for (const flow of flows) {
    // Para cada método de pago
    for (const method of methods) {
      // Simular conversación completa
      const response = await engine.processMessage({
        chatId: 'training-xxx',
        message: userMessage,
        userId: product.userId
      });
      
      // Si la respuesta tiene alta confianza (>70%)
      if (response.confidence > 0.7) {
        // Guardar en base de conocimiento local
        await LocalKnowledgeBase.saveSuccessfulResponse({
          userQuery: userMessage,
          botResponse: response.text,
          productId: product.id,
          confidence: response.confidence
        });
      }
    }
  }
}
```

### 2. Durante Uso Real (Sin Tokens)

```typescript
// Cuando no hay tokens de IA disponibles
const localResponse = await LocalKnowledgeBase.findSimilarResponse({
  userQuery: 'Curso de piano',
  productId: 'xxx'
});

if (localResponse) {
  // Usar respuesta de base de conocimiento
  return localResponse.response;
}
```

## Base de Conocimiento Local

### Estructura

```typescript
model KnowledgeBase {
  id          String   @id @default(cuid())
  userQuery   String   // Pregunta del cliente
  botResponse String   // Respuesta del bot
  productId   String?  // Producto relacionado
  confidence  Float    // Confianza (0-1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Búsqueda Inteligente

La base de conocimiento usa búsqueda semántica:

1. **Coincidencia exacta** (100% confianza)
2. **Palabras clave similares** (80-90% confianza)
3. **Contexto del producto** (70-80% confianza)

## Beneficios

### ✅ Sin Dependencia de Tokens

- El bot puede funcionar completamente sin tokens de IA
- Respuestas instantáneas desde base de conocimiento local
- Sin límites de rate limit

### ✅ Respuestas Consistentes

- Las respuestas son siempre las mismas para consultas similares
- No hay variación por temperatura de IA
- Formato consistente

### ✅ Más Rápido

- No hay latencia de API externa
- Búsqueda local en milisegundos
- Mejor experiencia de usuario

### ✅ Más Económico

- No consume tokens de IA
- Reduce costos significativamente
- Escalable sin costo adicional

## Estadísticas Esperadas

### Después de Entrenamiento Rápido

```
📦 Productos entrenados: 10
💬 Conversaciones totales: 40
✅ Conversaciones exitosas: 38 (95%)
🧠 Respuestas guardadas: 120
📈 Cobertura: ~60% de consultas comunes
```

### Después de Entrenamiento Completo

```
📦 Productos entrenados: 100+
💬 Conversaciones totales: 2500+
✅ Conversaciones exitosas: 2400+ (96%)
🧠 Respuestas guardadas: 7000+
📈 Cobertura: ~90% de consultas comunes
```

## Mantenimiento

### Actualizar Conocimiento

Cuando agregues nuevos productos o cambies precios:

```bash
# Re-entrenar solo productos nuevos
npx tsx scripts/entrenar-rapido.ts

# O re-entrenar todo
npx tsx scripts/entrenar-conversaciones-completas.ts
```

### Limpiar Conocimiento Antiguo

```sql
-- Eliminar respuestas con baja confianza
DELETE FROM "KnowledgeBase" WHERE confidence < 0.6;

-- Eliminar respuestas de productos eliminados
DELETE FROM "KnowledgeBase" 
WHERE "productId" NOT IN (SELECT id FROM "Product");
```

### Ver Estadísticas

```bash
npx tsx scripts/test-sin-tokens.ts
```

## Uso en Producción

### Configuración Recomendada

```env
# Habilitar fallback local
AI_FALLBACK_ENABLED=true

# Prioridad de respuestas
# 1. Groq (rápido, con tokens)
# 2. Base de conocimiento local (sin tokens)
# 3. Ollama (local, sin tokens)
```

### Flujo de Respuesta

```
1. Intentar con Groq (si hay tokens)
   ↓ (si falla o no hay tokens)
2. Buscar en base de conocimiento local
   ↓ (si no encuentra)
3. Intentar con Ollama (si está habilitado)
   ↓ (si falla)
4. Respuesta genérica de fallback
```

## Próximos Pasos

1. ✅ **Ejecutar entrenamiento rápido**
   ```bash
   npx tsx scripts/entrenar-rapido.ts
   ```

2. ✅ **Verificar funcionamiento**
   ```bash
   npx tsx scripts/test-sin-tokens.ts
   ```

3. ✅ **Probar en WhatsApp real**
   - Desconectar internet temporalmente
   - Verificar que el bot responde desde conocimiento local

4. ✅ **Ejecutar entrenamiento completo** (opcional)
   ```bash
   npx tsx scripts/entrenar-conversaciones-completas.ts
   ```

## Notas Importantes

⚠️ **El entrenamiento completo puede tomar 30-60 minutos**
- Usa el entrenamiento rápido primero para probar
- Ejecuta el completo en horarios de baja actividad

⚠️ **Consumo de tokens durante entrenamiento**
- El entrenamiento usa tokens de IA para generar respuestas
- Una vez entrenado, NO consume más tokens

⚠️ **Base de datos**
- Las respuestas se guardan en PostgreSQL/SQLite
- Asegúrate de tener espacio suficiente (~100MB para entrenamiento completo)

## Soporte

Si tienes problemas:

1. Verifica que la base de datos esté funcionando
2. Verifica que tengas tokens de IA para el entrenamiento inicial
3. Revisa los logs del entrenamiento
4. Ejecuta el test sin tokens para verificar cobertura

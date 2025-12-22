# ⚡ COMANDOS RÁPIDOS - SISTEMA DE PREGUNTAS DE SEGUIMIENTO

## 🧪 Probar Sistema

### Windows
```bash
PROBAR_SEGUIMIENTO_AHORA.bat
```

### Linux/Mac
```bash
npx tsx scripts/test-preguntas-seguimiento.ts
```

## 🚀 Iniciar Bot

```bash
npm run dev
```

## 📊 Ver Memoria de Conversación

En el código:
```typescript
import { ProfessionalConversationMemory } from './src/lib/professional-conversation-memory'

const conversationKey = `${userId}:${customerPhone}`
const memory = ProfessionalConversationMemory.getMemory(conversationKey)

console.log('Producto actual:', memory?.currentProduct?.name)
console.log('Historial:', memory?.conversationHistory)
console.log('Intenciones:', memory?.state.intentions)
```

## 🔍 Debug

### Ver Logs del Bot
```bash
# Los logs aparecen en la consola cuando ejecutas npm run dev
# Busca líneas como:
[Bot24/7] 🔍 Intención de seguimiento: { type: 'more_info', confidence: 0.9 }
[Bot24/7] 💡 Usando contexto para pregunta de seguimiento: Megapack de Piano
[Bot24/7] ✅ Respuesta contextual generada
```

### Verificar Detección
```typescript
import { FollowUpIntentDetector } from './src/lib/follow-up-intent-detector'

const intent = FollowUpIntentDetector.detect('más información')
console.log(intent)
// { type: 'more_info', confidence: 0.9, needsContext: true }
```

## 📝 Ejemplos de Prueba

### Conversación Completa
```
1. "Megapack de Piano"
2. "más información"
3. "métodos de pago"
4. "cuánto cuesta"
5. "sí quiero"
```

### Cambio de Producto
```
1. "Megapack de Piano"
2. "más información"
3. "Y el de guitarra?"
4. "métodos de pago"  (debe usar Guitarra, no Piano)
```

### Sin Contexto
```
1. "más información"  (debe preguntar "¿sobre qué producto?")
```

## 🔧 Configuración

### Cambiar Duración de Memoria
```typescript
// En src/lib/conversation-context-service.ts
private static CONTEXT_TIMEOUT = 30 * 60 * 1000 // 30 minutos
```

### Agregar Nuevo Patrón
```typescript
// En src/lib/follow-up-intent-detector.ts
private static patterns = {
  // ... patrones existentes
  nuevo_tipo: [
    /nuevo patrón/i,
    /otro patrón/i
  ]
}
```

## 📚 Documentación

```bash
# Ver documentación completa
cat SISTEMA_PREGUNTAS_SEGUIMIENTO.md

# Ver guía rápida
cat LISTO_PREGUNTAS_SEGUIMIENTO.md

# Ver resumen
cat RESUMEN_FINAL_SEGUIMIENTO.md
```

## ✅ Checklist Rápido

```bash
# 1. Probar sistema
PROBAR_SEGUIMIENTO_AHORA.bat

# 2. Iniciar bot
npm run dev

# 3. Conectar WhatsApp
# (escanear QR)

# 4. Probar conversación
# Enviar: "Megapack de Piano"
# Enviar: "más información"
# Verificar que responda sobre el Piano

# 5. Verificar logs
# Buscar: [Bot24/7] 💡 Usando contexto
```

## 🎯 Patrones Comunes

### Más Información
```
más información
cuéntame más
qué más
más detalles
```

### Métodos de Pago
```
métodos de pago
cómo pago
formas de pago
puedo pagar con
```

### Confirmación
```
sí quiero
lo compro
proceder
ok
dale
listo
```

### Precio
```
cuánto cuesta
precio
valor
cuánto es
```

## 🚨 Troubleshooting

### Bot no usa contexto
```bash
# Verificar que la memoria esté guardando
# Ver logs: [Bot24/7] 💾 Guardando producto en memoria
```

### Bot pregunta "¿de qué?"
```bash
# Verificar que detecte seguimiento
# Ver logs: [Bot24/7] 🔍 Intención de seguimiento
```

### Memoria expiró
```bash
# La memoria dura 30 minutos
# Verificar tiempo transcurrido
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del bot
2. Ejecuta el test automatizado
3. Verifica la documentación completa
4. Revisa el código en los archivos mencionados

---

**¡Todo listo para usar!** 🚀

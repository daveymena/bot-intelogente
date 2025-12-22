# INTEGRACIÓN DE MEGAFLUJOS EN EL BOT

## 📋 Resumen

Se han integrado **68 ejemplos de entrenamiento** basados en 8 megaflujos complejos.

## 🎯 Cómo usar en tu bot

### Opción 1: Groq API (Recomendado)

```typescript
import { Groq } from 'groq-sdk';
import megaflujos from '@/data/megaflujos-integracion-bot.json';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Usar ejemplos como contexto
const ejemplosFormato = megaflujos.ejemplos
  .map(e => `Usuario: ${e.entrada}\nBot: ${e.salida}`)
  .join('\n\n');

const response = await groq.chat.completions.create({
  model: 'mixtral-8x7b-32768',
  messages: [
    {
      role: 'system',
      content: `Eres un asistente de ventas. Aquí hay ejemplos de conversaciones exitosas:\n\n${ejemplosFormato}`
    },
    {
      role: 'user',
      content: userMessage
    }
  ]
});
```

### Opción 2: Búsqueda Semántica

```typescript
// Buscar ejemplos similares a la entrada del usuario
function buscarEjemplosSimilares(entrada: string, topK = 3) {
  return megaflujos.ejemplos
    .filter(e => 
      e.entrada.toLowerCase().includes(entrada.toLowerCase()) ||
      e.intención === detectarIntención(entrada)
    )
    .slice(0, topK);
}

// Usar ejemplos como contexto en la respuesta
const ejemplosSimilares = buscarEjemplosSimilares(userMessage);
const contexto = ejemplosSimilares
  .map(e => `Ejemplo: ${e.entrada} → ${e.salida}`)
  .join('\n');
```

### Opción 3: Fine-tuning Local

```bash
# Si usas Ollama o modelo local
npx tsx scripts/entrenar-modelo-local.ts --data data/megaflujos-integracion-bot.json
```

## 📊 Categorías de Entrenamiento

- **tecnologia_contraentrega**
- **dropshipping**
- **servicios_citas**
- **soporte_tecnico**
- **productos_digitales**
- **fiados_credito**
- **cliente_agresivo**
- **cliente_indeciso**

## 🎓 Ejemplos por Complejidad

- **alta**: 37 ejemplos
- **media**: 10 ejemplos
- **muy_alta**: 21 ejemplos

## 🚀 Próximos Pasos

1. ✅ Megaflujos consolidados
2. ✅ Ejemplos extraídos (68 ejemplos)
3. ⏳ Integrar en tu sistema de IA
4. ⏳ Probar con casos reales
5. ⏳ Ajustar según feedback

## 📁 Archivos Generados

- `data/megaflujos-consolidado-final.json` - Megaflujos completos
- `data/ejemplos-entrenamiento-megaflujos.json` - Ejemplos para entrenar
- `data/megaflujos-integracion-bot.json` - Formato para integración
- `RESUMEN_ENTRENAMIENTO_MEGAFLUJOS.md` - Documentación

## 💡 Tips

- Los ejemplos cubren casos reales: objeciones, miedos, comparaciones
- Cada ejemplo incluye intención, sentimiento y acciones recomendadas
- Usa la categoría para filtrar por tipo de conversación
- El contexto incluye información sobre el megaflujo original

## ❓ Preguntas Frecuentes

**¿Cómo agrego más ejemplos?**
Crea nuevos megaflujos en `data/megaflujos-parte-X.json` y ejecuta:
```bash
npx tsx scripts/cargar-y-entrenar-megaflujos.ts
npx tsx scripts/entrenar-con-megaflujos-final.ts
```

**¿Cómo personalizo las respuestas?**
Edita los ejemplos en `data/megaflujos-integracion-bot.json` o crea nuevos megaflujos.

**¿Funciona con WhatsApp?**
Sí, integra estos ejemplos en tu `ai-service.ts` o `intelligent-response-service.ts`.

# 🎯 PROMPT SIMPLIFICADO PARA OLLAMA

## Cambios realizados:

1. **Prompt más corto** (de ~200 líneas a ~30 líneas)
2. **Instrucciones directas** sin ejemplos largos
3. **Énfasis en memoria** y contexto
4. **Formato claro** para mostrar productos

## Problema detectado:

El modelo llama3.1:8b está:
- ✅ Respondiendo rápido
- ✅ Manteniendo algo de contexto
- ❌ Inventando productos en lugar de usar los de la BD
- ❌ Repitiendo saludos

## Solución aplicada:

```typescript
// Prompt simplificado
let prompt = `Eres Laura, vendedora de Tecnovariedades D&S por WhatsApp.

REGLAS BÁSICAS:
- Lee TODO el historial antes de responder
- Si el cliente dice "opción 2" → Busca qué productos YA mostraste
- NO repitas el saludo si ya saludaste
- Responde SOLO lo que preguntó (máximo 4 líneas)
- Usa emojis sutiles 😊

PRODUCTOS:
- Si hay productos abajo, USA SOLO ESOS (nombres y precios exactos)
- NO inventes productos ni precios
- Las fotos se envían automáticamente (no las menciones)

PAGOS:
- Métodos: MercadoPago, PayPal, Nequi, Daviplata
- NO inventes otros métodos

PRIMER MENSAJE:
"👋 ¡Hola! 😊 Bienvenido a Tecnovariedades D&S

Soy Laura. ¿En qué puedo ayudarte?"

OTROS MENSAJES:
- NO saludes de nuevo
- Sé directo y natural
- Mantén el contexto
`
```

## Próximos pasos:

1. Ajustar cómo se muestran los productos en el prompt
2. Aumentar `repeat_penalty` para evitar repeticiones
3. Probar con conversaciones más largas

## Configuración actual:

```env
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT=90000
OLLAMA_MAX_TOKENS=400
DISABLE_GROQ=true
```

## Resultado esperado:

```
Cliente: "Busco laptop para diseño"
Laura: "¡Perfecto! 😊 Tengo estas opciones:

1. Portátil Asus Vivobook - $1.769.900 COP
2. Portatil Asus X1502za - $1.749.900 COP

¿Cuál te interesa?"

Cliente: "Cuéntame de la opción 2"
Laura: "El Asus X1502za tiene:
- Intel Core i5-12500h
- 8GB RAM DDR4
- 512GB SSD
- Pantalla 15.6"

Ideal para diseño. ¿Te interesa?"
```

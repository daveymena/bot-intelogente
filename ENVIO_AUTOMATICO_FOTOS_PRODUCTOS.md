# 📸 ENVÍO AUTOMÁTICO DE FOTOS DE PRODUCTOS

## 🎯 Objetivo

Cuando el bot muestra un producto al cliente, debe enviar **automáticamente** las fotos del producto junto con la descripción, sin que el cliente tenga que pedirlas.

## 🔧 Implementación

### 1. Modificación de AIResponse Interface

Agregado campos para manejar fotos automáticas:

```typescript
// src/lib/ai-service.ts
interface AIResponse {
  message: string
  confidence: number
  intent?: string
  productMentioned?: string
  productId?: string           // ✨ NUEVO: ID del producto
  shouldSendPhotos?: boolean   // ✨ NUEVO: Flag para enviar fotos
  photos?: string[]            // ✨ NUEVO: URLs de las fotos
}
```

### 2. Preparación de Fotos en AIService

Cuando se genera una respuesta sobre un producto, se preparan las fotos:

```typescript
// src/lib/ai-service.ts - línea ~590
// 📸 Preparar fotos del producto para envío automático
const photos = product.images ? JSON.parse(product.images as string) : []
const shouldSendPhotos = photos.length > 0

return {
  message: aiResponse,
  confidence: productIntent.confidence,
  intent: productIntent.type,
  productId: product.id,
  shouldSendPhotos,
  photos: photos.slice(0, 3) // Máximo 3 fotos
}
```

### 3. Envío Automático en Baileys

Después de enviar la respuesta de texto, se envían las fotos automáticamente:

```typescript
// src/lib/baileys-stable-service.ts - línea ~470
// 📸 ENVIAR FOTOS AUTOMÁTICAMENTE si hay producto con fotos
if (aiResponse.shouldSendPhotos && aiResponse.photos && aiResponse.photos.length > 0) {
  console.log(`[Baileys] 📸 Enviando ${aiResponse.photos.length} foto(s) del producto automáticamente...`)
  
  // Pequeña pausa antes de enviar fotos (más natural)
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  for (let i = 0; i < aiResponse.photos.length; i++) {
    const photoUrl = aiResponse.photos[i]
    
    const imageData = await MediaService.prepareImageMessage(photoUrl)
    
    await socket.sendMessage(from, {
      image: imageData.image,
      caption: imageData.caption || ''
    })
    
    // Pausa entre fotos (800ms)
    if (i < aiResponse.photos.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }
}
```

## 📊 Flujo Completo (MEJORADO)

```
1. Usuario: "Busco un portátil"
   ↓
2. AIService busca producto
   ↓
3. AIService genera respuesta + prepara fotos
   ↓
4. Baileys envía FOTO 1 con la descripción completa como caption
   ↓
5. Pausa de 1 segundo
   ↓
6. Baileys envía foto 2 (sin caption)
   ↓
7. Pausa de 0.8 segundos
   ↓
8. Baileys envía foto 3 (sin caption)
```

**Ventaja**: La información y la foto llegan juntas, se ve más profesional y natural.

## ⏱️ Tiempos de Espera

- **Antes de primera foto**: 1500ms (1.5 segundos)
  - Simula que el vendedor busca las fotos
  
- **Entre fotos**: 800ms (0.8 segundos)
  - Simula que el vendedor selecciona y envía cada foto

## 📸 Límites

- **Máximo de fotos**: 3 por producto
- **Formato**: URLs de imágenes del campo `images` en la BD
- **Orden**: Se envían en el orden que están en el array

## 🎯 Ventajas

1. ✅ **Experiencia mejorada**: Cliente ve fotos sin pedirlas
2. ✅ **Más natural**: Simula vendedor real que muestra fotos
3. ✅ **Menos fricción**: No requiere mensaje adicional del cliente
4. ✅ **Mayor conversión**: Cliente ve producto inmediatamente
5. ✅ **Contexto visual**: Fotos refuerzan la descripción

## 🔍 Casos de Uso

### Caso 1: Búsqueda de Producto
```
Usuario: "Busco un portátil gaming"
Bot: "Te recomiendo el HP Pavilion Gaming..."
     [Envía 3 fotos automáticamente]
```

### Caso 2: Pregunta sobre Producto Específico
```
Usuario: "Cuéntame del curso de piano"
Bot: "El Curso de Piano Profesional incluye..."
     [Envía 3 fotos automáticamente]
```

### Caso 3: Pregunta de Seguimiento
```
Usuario: "¿Cuánto cuesta?"
Bot: "El portátil HP cuesta 2.500.000 COP"
     [Envía 3 fotos automáticamente]
```

## 🚫 Cuándo NO se Envían Fotos

- ❌ Producto no tiene fotos en la BD
- ❌ Respuesta no es sobre un producto específico
- ❌ Es un saludo o pregunta general
- ❌ Error al preparar las imágenes

## 📝 Logs para Debugging

Busca estos logs para verificar el funcionamiento:

```
[Baileys] ✅ Respuesta generada (confianza: 95%)
[Baileys] ✅ Mensaje enviado con simulación humana
[Baileys] 📸 Enviando 3 foto(s) del producto automáticamente...
[Baileys] 📤 Enviando foto 1/3: https://...
[Baileys] ✅ Foto 1 enviada
[Baileys] 📤 Enviando foto 2/3: https://...
[Baileys] ✅ Foto 2 enviada
[Baileys] 📤 Enviando foto 3/3: https://...
[Baileys] ✅ Foto 3 enviada
[Baileys] ✅ Todas las fotos enviadas automáticamente
```

## 🧪 Cómo Probar

1. Asegúrate de que el bot esté corriendo
2. Envía desde WhatsApp: "Busco un portátil"
3. Espera la respuesta del bot
4. Verifica que después de la respuesta de texto, lleguen las fotos automáticamente
5. Revisa los logs del servidor para confirmar el envío

## 📋 Archivos Modificados

- ✅ `src/lib/ai-service.ts` - Interface AIResponse + preparación de fotos
- ✅ `src/lib/baileys-stable-service.ts` - Envío automático de fotos

## 🔄 Compatibilidad

- ✅ Compatible con sistema de contexto
- ✅ Compatible con simulación humana
- ✅ Compatible con sistema de memoria
- ✅ No interfiere con solicitudes manuales de fotos

---

**Estado**: ✅ Implementado
**Fecha**: 20 de Noviembre 2025

# 🔧 Instrucciones para Arreglar Envío de Fotos de Productos

## Problema Actual

1. ❌ Cuando lista varios PCs, solo envía foto del más caro
2. ❌ Cuando pregunta por uno específico, envía foto incorrecta
3. ❌ No envía cada producto con su foto correspondiente

## Solución

He creado un nuevo servicio `ProductPhotoSender` que:
- ✅ Envía cada producto con su foto correspondiente
- ✅ Envía productos uno por uno (texto + foto)
- ✅ Verifica que la foto sea la correcta

## Archivos Creados

1. ✅ `src/lib/product-photo-sender.ts` - Nuevo servicio especializado

## Modificaciones Necesarias

### 1. En `src/lib/hybrid-intelligent-response-system.ts`

Buscar el método `processMessage` y agregar al final (antes del return):

```typescript
// 📸 ENVIAR PRODUCTOS CON FOTOS
if (products.length > 0 && intent.type === 'product_search') {
  console.log(`[Hybrid] 📸 Enviando ${products.length} productos con fotos`)
  
  // Importar servicio de fotos
  const { ProductPhotoSender } = await import('./product-photo-sender')
  
  // Enviar productos con fotos (máximo 5)
  await ProductPhotoSender.sendProductsWithPhotos(
    socket,
    from,
    products,
    5 // máximo 5 productos
  )
}
```

### 2. En `src/lib/baileys-stable-service.ts`

Buscar el método `handleHybridResponse` y modificar la sección donde dice:

```typescript
// Si encontró producto con alta confianza, enviar foto + info
if (productMatch && productMatch.confidence >= 70) {
```

Reemplazar toda esa sección por:

```typescript
// Si encontró producto(s), enviar con fotos
if (productMatch && productMatch.confidence >= 70) {
  const { ProductPhotoSender } = await import('./product-photo-sender')
  
  // Si es un solo producto
  if (productMatch.products && productMatch.products.length === 1) {
    await ProductPhotoSender.sendSingleProductWithPhoto(
      socket,
      from,
      productMatch.products[0],
      1,
      1
    )
  }
  // Si son varios productos
  else if (productMatch.products && productMatch.products.length > 1) {
    await ProductPhotoSender.sendProductsWithPhotos(
      socket,
      from,
      productMatch.products,
      5 // máximo 5
    )
  }
  
  // Guardar en DB
  await db.message.create({
    data: {
      conversationId,
      content: `[Enviados ${productMatch.products.length} productos con fotos]`,
      direction: 'OUTGOING',
      type: 'IMAGE'
    }
  })
  
  return // No enviar respuesta de texto adicional
}
```

## Alternativa Más Simple (Recomendada)

Si lo anterior es muy complejo, puedes hacer esto:

### En `src/lib/baileys-stable-service.ts`

Buscar donde dice:

```typescript
// 📸 ENVIAR FOTOS SI EL CLIENTE LAS PIDIÓ
await this.sendProductPhotosIfRequested(socket, userId, from, messageText, conversationId)
```

Y reemplazar por:

```typescript
// 📸 ENVIAR PRODUCTOS CON FOTOS AUTOMÁTICAMENTE
const { ProductPhotoSender } = await import('./product-photo-sender')
const { ProductIntelligenceService } = await import('./product-intelligence-service')

// Buscar productos mencionados en el mensaje
const searchResults = await ProductIntelligenceService.intelligentSearch(messageText, userId)

if (searchResults.products && searchResults.products.length > 0) {
  console.log(`[Baileys] 📸 Enviando ${searchResults.products.length} productos con fotos`)
  
  await ProductPhotoSender.sendProductsWithPhotos(
    socket,
    from,
    searchResults.products,
    5 // máximo 5 productos
  )
}
```

## Testing

Para probar:

1. Pregunta: "Qué PCs tienes?"
   - Debería enviar cada PC con su foto correspondiente

2. Pregunta: "Cuánto cuesta el Lenovo?"
   - Debería enviar solo el Lenovo con su foto

3. Pregunta: "Muéstrame laptops para gaming"
   - Debería enviar las laptops gaming con sus fotos

## Notas Importantes

- El servicio descarga las imágenes automáticamente
- Convierte URLs de Google Drive a URLs directas
- Maneja errores gracefully (si falla la foto, envía solo texto)
- Tiene pausas entre productos para no saturar WhatsApp
- Formatea el caption con toda la información del producto

## Si Algo Falla

1. Revisa los logs del servidor
2. Verifica que los productos tengan imágenes en la BD
3. Verifica que las URLs de las imágenes sean accesibles
4. Prueba con un solo producto primero

---

**Estado**: Servicio creado, pendiente integración
**Prioridad**: Alta
**Impacto**: Mejora significativa en UX

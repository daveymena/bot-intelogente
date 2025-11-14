# 🔍 Problemas Encontrados y Soluciones

## Fecha: 13 de Noviembre 2025

### Problema 1: Bot no encuentra "curso de diseño gráfico"

**Estado**: ✅ IDENTIFICADO

**Causa Raíz**:
- El producto existe en la BD: "Mega Pack 01: Cursos Diseño Gráfico"
- La búsqueda literal funciona con "diseño gráfico" pero NO con "curso de diseño gráfico"
- El sistema de IA debería manejar esto, pero parece no estar funcionando correctamente

**Evidencia**:
```bash
# Búsqueda exitosa:
"diseño gráfico" → ✅ Encuentra "Mega Pack 01: Cursos Diseño Gráfico"
"mega pack 01" → ✅ Encuentra el producto

# Búsqueda fallida:
"curso de diseño gráfico" → ❌ No encuentra nada
"curso diseño" → ❌ No encuentra nada
"mega pack diseño" → ❌ No encuentra nada
```

**Producto en BD**:
```json
{
  "id": "cmhpw941q0000kmp85qvjm0o5-mp01",
  "name": "Mega Pack 01: Cursos Diseño Gráfico",
  "price": 20000,
  "images": "[\"https://hotmart.s3.amazonaws.com/...\"]",
  "tags": "[\"megapack\",\"curso\",\"digital\",\"diseno_creatividad\"]",
  "status": "AVAILABLE"
}
```

**Solución Propuesta**:
1. Mejorar el sistema de búsqueda para que sea más flexible
2. Agregar más términos de búsqueda en los tags
3. Verificar que el sistema de IA esté recibiendo todos los productos

---

### Problema 2: Bot no envía fotos de productos

**Estado**: ⚠️ PARCIALMENTE IDENTIFICADO

**Causa Raíz**:
- El servicio `ProductPhotoSender` existe y está bien implementado
- Se llama correctamente desde `baileys-stable-service.ts`
- El producto SÍ tiene foto en la BD

**Evidencia**:
```javascript
// El producto tiene foto:
"images": "[\"https://hotmart.s3.amazonaws.com/product_pictures/...\"]"

// El servicio se llama:
const result = await ProductPhotoSender.sendProductsWithPhotos(
  socket,
  from,
  [selection.selectedProduct],
  1
)
```

**Posibles Causas**:
1. ❓ El flujo no llega a la parte donde se envían fotos
2. ❓ Hay un error silencioso al descargar/enviar la imagen
3. ❓ El socket de WhatsApp no está conectado cuando intenta enviar
4. ❓ La URL de la imagen no es accesible

**Solución Propuesta**:
1. Agregar más logs para rastrear el flujo completo
2. Verificar que el socket esté conectado antes de enviar
3. Probar la descarga de la imagen manualmente
4. Verificar que no haya errores silenciosos

---

## Próximos Pasos

### 1. Arreglar Búsqueda de "curso de diseño gráfico"

```typescript
// Opción A: Mejorar tags en la BD
await prisma.product.update({
  where: { id: 'cmhpw941q0000kmp85qvjm0o5-mp01' },
  data: {
    tags: JSON.stringify([
      "megapack",
      "curso",
      "cursos",
      "digital",
      "diseño",
      "diseno",
      "gráfico",
      "grafico",
      "diseño gráfico",
      "diseno grafico",
      "photoshop",
      "illustrator",
      "indesign",
      "diseno_creatividad"
    ])
  }
})

// Opción B: Mejorar el algoritmo de búsqueda
// Hacer búsqueda por palabras individuales y combinar resultados
```

### 2. Arreglar Envío de Fotos

```typescript
// Agregar logs detallados en ProductPhotoSender
console.log('[DEBUG] 1. Iniciando envío de foto')
console.log('[DEBUG] 2. Socket conectado:', !!socket)
console.log('[DEBUG] 3. URL de imagen:', photoUrl)
console.log('[DEBUG] 4. Descargando imagen...')
console.log('[DEBUG] 5. Imagen descargada, tamaño:', buffer.length)
console.log('[DEBUG] 6. Enviando a WhatsApp...')
console.log('[DEBUG] 7. Enviado exitosamente')
```

### 3. Test Manual

```bash
# 1. Verificar que el producto existe
node buscar-producto-diseño.js

# 2. Probar búsqueda con diferentes términos
node test-busqueda-diseño.js

# 3. Iniciar el bot y probar manualmente
npm run dev

# 4. Enviar mensaje de prueba:
"Busco curso de diseño gráfico"
```

---

## Comandos Útiles

```bash
# Ver productos con "diseño"
node buscar-producto-diseño.js

# Test de búsqueda
node test-busqueda-diseño.js

# Ver logs del bot en tiempo real
npm run dev | findstr "Baileys ProductPhotoSender"

# Limpiar sesión de WhatsApp
node diagnosticar-whatsapp.js
```

---

## Notas Adicionales

- El producto existe y tiene foto ✅
- El servicio de fotos está implementado ✅
- La búsqueda literal funciona parcialmente ⚠️
- Necesitamos más logs para debug 🔍

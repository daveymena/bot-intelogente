# Fix: URL de Imagen Inválida

## 🐛 Error Detectado

```
[Baileys] ❌ Error enviando imagen con caption: TypeError: Invalid URL
input: 'h'
```

La URL de la imagen era solo la letra "h" en lugar de una URL completa.

## 🔍 Causa Raíz

El campo `product.images` en la base de datos puede contener:
1. Un array de strings: `["https://...", "https://..."]`
2. Un string con array: `"[\"https://...\"]"`
3. Una URL incompleta o corrupta: `"h"`
4. `undefined` o `null`

El código no validaba la URL antes de intentar descargarla.

## ✅ Solución Aplicada

### 1. Nuevo Método `getValidImageUrl()`

Agregado en `src/agents/product-agent.ts`:

```typescript
private getValidImageUrl(imageUrl: string | undefined): string | undefined {
  // Validaciones:
  1. Verifica que existe
  2. Si es array en string, parsea y toma el primero
  3. Valida que empiece con http:// o https://
  4. Valida longitud mínima (10 caracteres)
  5. Retorna URL válida o undefined
}
```

### 2. Uso del Método

```typescript
metadata: shouldSendPhoto && product.images?.[0] ? {
  sendAsImageWithCaption: true,
  productId: product.id,
  imageUrl: this.getValidImageUrl(product.images[0])  // ✅ Validado
} : undefined
```

## 🧪 Cómo Probar

### 1. Reiniciar el servidor

```bash
npm run dev
```

### 2. Enviar en WhatsApp

```
curso de piano
```

### 3. Verificar en logs

Deberías ver:

```
[ProductAgent] ✅ URL válida: https://...
[Baileys] 📸 Enviando imagen con texto como caption...
[Baileys] ✅ Imagen con caption enviada exitosamente
```

O si la URL es inválida:

```
[ProductAgent] ⚠️ URL inválida: h
[ProductAgent] ⚠️ No hay URL de imagen
```

## 🎯 Resultado Esperado

### Si la URL es válida:
```
[FOTO DEL PRODUCTO]

📦 Curso Completo de Piano Online
...
```

### Si la URL es inválida:
```
📦 Curso Completo de Piano Online
...
(Sin foto, pero sin error)
```

## 🔧 Casos Manejados

1. ✅ URL válida: `https://example.com/image.jpg`
2. ✅ Array en string: `"[\"https://...\"]"` → Parsea y toma el primero
3. ✅ URL incompleta: `"h"` → Retorna undefined (no envía foto)
4. ✅ Sin URL: `undefined` → Retorna undefined (no envía foto)
5. ✅ URL sin protocolo: `"example.com/image.jpg"` → Retorna undefined

## 📝 Logs de Debugging

El método ahora muestra logs claros:

```
✅ URL válida: https://example.com/image.jpg...
⚠️ URL inválida: h
⚠️ URL demasiado corta: h
⚠️ No hay URL de imagen
⚠️ Error parseando array de imágenes
```

## 🚨 Si el Problema Persiste

### Verificar la Base de Datos

```sql
SELECT id, name, images FROM Product WHERE name LIKE '%piano%';
```

Verifica que el campo `images` contenga:
- Un array válido de URLs
- URLs completas con http:// o https://
- No solo letras sueltas

### Actualizar Producto

Si el producto tiene URL inválida:

```typescript
await db.product.update({
  where: { id: 'producto-id' },
  data: {
    images: ['https://url-valida.com/imagen.jpg']
  }
});
```

## ✅ Checklist

- [x] Método `getValidImageUrl()` agregado
- [x] Validación de URL implementada
- [x] Logs de debugging agregados
- [x] Manejo de arrays en string
- [x] Manejo de URLs inválidas
- [ ] Servidor reiniciado
- [ ] Prueba en WhatsApp
- [ ] Foto enviada correctamente

---

**Última actualización**: 22 de Noviembre de 2025

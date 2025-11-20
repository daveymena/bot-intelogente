# ✅ Corrección: Error JSON en Imágenes de Productos

## 🔴 Error Detectado

```
Error buscando productos: SyntaxError: Unexpected token 'h', "https://ho"... is not valid JSON
at SearchAgent.mapProduct (src\agents\search-agent.ts:729:30)
```

## 🎯 Causa

El método `mapProduct()` intentaba hacer `JSON.parse(p.images)` asumiendo que siempre era un JSON array, pero las imágenes pueden estar en diferentes formatos:

1. **URL directa**: `"https://hotmart.s3.amazonaws.com/..."`
2. **JSON array**: `["url1", "url2"]`
3. **Array de JavaScript**: `["url1", "url2"]`

Cuando era una URL directa (como las imágenes de megapacks que acabamos de actualizar), intentaba parsear la URL como JSON y fallaba.

## 🔧 Solución

**ANTES**:
```typescript
private mapProduct(p: any): Product {
  return {
    images: p.images ? JSON.parse(p.images) : [],
    // ...
  };
}
```

**AHORA**:
```typescript
private mapProduct(p: any): Product {
  let images: string[] = [];
  if (p.images) {
    if (typeof p.images === 'string') {
      if (p.images.startsWith('http')) {
        // Es una URL directa
        images = [p.images];
      } else if (p.images.startsWith('[')) {
        // Es un JSON array
        try {
          images = JSON.parse(p.images);
        } catch (e) {
          images = [p.images];
        }
      } else {
        images = [p.images];
      }
    } else if (Array.isArray(p.images)) {
      // Ya es un array
      images = p.images;
    }
  }
  
  return {
    images,
    // ...
  };
}
```

## ✅ Resultado

Ahora el método maneja correctamente **TODOS** los formatos de imágenes:

1. ✅ URL directa: `"https://..."` → `["https://..."]`
2. ✅ JSON array: `["url1", "url2"]` → `["url1", "url2"]`
3. ✅ Array JS: `["url1", "url2"]` → `["url1", "url2"]`
4. ✅ Null/undefined: `null` → `[]`

## 📊 Flujo Corregido

```
Cliente: "estoy interesado en el curso de piano"
    ↓
IntentDetector: ✅ Detecta búsqueda
    ↓
SearchAgent: ✅ Encuentra "Curso Completo de Piano Online" (score: 39)
    ↓
mapProduct(): ✅ Procesa imagen correctamente
    ↓
✅ Muestra producto al cliente
```

## 📁 Archivo Modificado

- ✅ `src/agents/search-agent.ts` (línea 729)

## 🚀 Próximo Paso

Reinicia el bot y prueba de nuevo:

```bash
npm run dev
```

Luego en WhatsApp:
```
"estoy interesado en el curso de piano"
→ ✅ Debería mostrar el curso correctamente
```

---

**Estado**: ✅ CORREGIDO

**Fecha**: 20 de Noviembre 2025

**Causa**: JSON.parse() en URL directa

**Solución**: Detección inteligente del formato de imagen

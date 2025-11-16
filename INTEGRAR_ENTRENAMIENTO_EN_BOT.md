# 🚀 INTEGRAR ENTRENAMIENTO EN EL BOT

**Archivo de entrenamiento**: `training-data-groq.json`  
**Estado**: ✅ Listo para integrar

---

## 📋 PASOS DE INTEGRACIÓN

### Paso 1: Copiar Archivo
```bash
# Copiar archivo de entrenamiento a src/lib/
cp training-data-groq.json src/lib/training-data-groq.json
```

### Paso 2: Actualizar training-data.ts
```typescript
// src/lib/training-data.ts

import trainingDataGroq from './training-data-groq.json';

export const trainingData = {
  // Datos de Groq (base rápida)
  groq: trainingDataGroq,
  
  // Ejemplos de entrenamiento
  ejemplos: [
    {
      pregunta: '¿Qué motos tienes?',
      respuesta: 'Tenemos varias motos disponibles...',
      categoria: 'Moto',
    },
    // ... más ejemplos
  ],
  
  // Categorías
  categorias: trainingDataGroq.categories,
  
  // Palabras clave
  palabrasClaves: trainingDataGroq.keywords,
};

export default trainingData;
```

### Paso 3: Usar en Búsqueda
```typescript
// src/lib/product-intelligence-service.ts

import { trainingData } from './training-data';

export class ProductIntelligenceService {
  static buscarPorCategoria(categoria: string) {
    return trainingData.groq.products.filter(
      p => p.categoria === categoria
    );
  }

  static buscarPorPalabraClave(keyword: string) {
    return trainingData.groq.products.filter(
      p => p.keywords.includes(keyword.toLowerCase())
    );
  }

  static obtenerProductosRelacionados(nombre: string) {
    const producto = trainingData.groq.products.find(
      p => p.nombre === nombre
    );
    
    if (!producto) return [];
    
    return trainingData.groq.products.filter(
      p => p.categoria === producto.categoria && p.id !== producto.id
    );
  }
}
```

### Paso 4: Usar en Respuestas
```typescript
// src/lib/intelligent-response-service.ts

import { ProductIntelligenceService } from './product-intelligence-service';

export class IntelligentResponseService {
  static generarRespuestaBusqueda(query: string) {
    // Buscar por palabra clave
    const productos = ProductIntelligenceService.buscarPorPalabraClave(query);
    
    if (productos.length === 0) {
      return 'No encontré productos con esa búsqueda.';
    }
    
    const lista = productos
      .slice(0, 5)
      .map(p => `• ${p.nombre} - $${p.precio}`)
      .join('\n');
    
    return `Encontré estos productos:\n${lista}`;
  }

  static generarRecomendacion(categoria: string) {
    const productos = ProductIntelligenceService.buscarPorCategoria(categoria);
    
    if (productos.length === 0) {
      return `No tenemos productos en la categoría ${categoria}.`;
    }
    
    const aleatorio = productos[Math.floor(Math.random() * productos.length)];
    return `Te recomiendo: ${aleatorio.nombre} - $${aleatorio.precio}`;
  }
}
```

---

## 🔍 ESTRUCTURA DEL ARCHIVO

```json
{
  "generatedAt": "2025-11-15T23:03:46.664Z",
  "totalProducts": 68,
  "products": [
    {
      "id": 1,
      "nombre": "Producto 1",
      "categoria": "Otro",
      "precio": 0,
      "descripcion": "Sin descripción",
      "keywords": ["electrónica", "tecnología", ...]
    }
  ],
  "categories": ["Otro", "Accesorio", "Moto", "Megapack"],
  "keywords": ["electrónica", "tecnología", ...],
  "stats": {
    "totalProducts": 68,
    "processed": 68,
    "errors": 0,
    "successRate": "100.00%"
  }
}
```

---

## 💡 CASOS DE USO

### 1. Búsqueda de Productos
```typescript
// Usuario: "¿Tienes motos?"
const motos = ProductIntelligenceService.buscarPorCategoria('Moto');
// Respuesta: Lista de motos disponibles
```

### 2. Búsqueda por Palabra Clave
```typescript
// Usuario: "Busco algo de tecnología"
const productos = ProductIntelligenceService.buscarPorPalabraClave('tecnología');
// Respuesta: Productos relacionados con tecnología
```

### 3. Recomendaciones
```typescript
// Usuario: "¿Qué me recomiendas?"
const recomendacion = IntelligentResponseService.generarRecomendacion('Moto');
// Respuesta: Recomendación personalizada
```

### 4. Productos Relacionados
```typescript
// Usuario: "¿Hay algo similar?"
const relacionados = ProductIntelligenceService.obtenerProductosRelacionados('Moto Honda');
// Respuesta: Productos similares
```

---

## 🧪 PRUEBAS

### Test de Búsqueda
```typescript
import { ProductIntelligenceService } from './product-intelligence-service';

describe('ProductIntelligenceService', () => {
  it('debe buscar por categoría', () => {
    const motos = ProductIntelligenceService.buscarPorCategoria('Moto');
    expect(motos.length).toBeGreaterThan(0);
  });

  it('debe buscar por palabra clave', () => {
    const productos = ProductIntelligenceService.buscarPorPalabraClave('moto');
    expect(productos.length).toBeGreaterThan(0);
  });

  it('debe obtener productos relacionados', () => {
    const relacionados = ProductIntelligenceService.obtenerProductosRelacionados('Producto 1');
    expect(Array.isArray(relacionados)).toBe(true);
  });
});
```

---

## 📊 ESTADÍSTICAS

| Métrica | Valor |
|---------|-------|
| Productos | 68 |
| Categorías | 4 |
| Palabras clave | 101 |
| Tasa de éxito | 100% |

---

## 🚀 PRÓXIMOS PASOS

### Inmediato
1. Copiar archivo a `src/lib/`
2. Actualizar `training-data.ts`
3. Usar en búsqueda y respuestas

### Corto Plazo
1. Usar con Ollama para embeddings
2. Mejorar búsqueda semántica
3. Optimizar recomendaciones

### Mediano Plazo
1. Agregar más productos
2. Mejorar categorización
3. Desplegar en producción

---

## ✅ CHECKLIST

- [ ] Copiar archivo a `src/lib/`
- [ ] Actualizar `training-data.ts`
- [ ] Implementar búsqueda por categoría
- [ ] Implementar búsqueda por palabra clave
- [ ] Implementar recomendaciones
- [ ] Ejecutar tests
- [ ] Pruebas en vivo
- [ ] Desplegar en producción

---

## 📞 SOPORTE

**¿Cómo actualizar el entrenamiento?**
→ Ejecuta `node entrenamiento-simple-groq.js` nuevamente

**¿Cómo agregar más productos?**
→ Actualiza `catalogo-completo-68-productos.json` y ejecuta el script

**¿Cómo mejorar con Ollama?**
→ Usa `ollama run llama2 < training-data-groq.json`

---

**Generado**: 15 de Noviembre de 2025  
**Estado**: ✅ LISTO PARA INTEGRAR

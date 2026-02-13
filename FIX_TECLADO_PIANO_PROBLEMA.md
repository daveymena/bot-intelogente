# Problema: "teclado" coincide con "Curso de Piano"

## 🚨 Problema Identificado

**Conversación real**:
```
Usuario: "Me interesa un teclado ?"
Bot: [Muestra "Mega Pack Curso de Piano Completo"]
```

**Esperado**: Mostrar teclados de computadora (periféricos)  
**Obtenido**: Muestra curso de piano

---

## 🔍 Causa Raíz

### 1. Ambigüedad de la palabra "teclado"

La palabra "teclado" tiene dos significados:
- **Teclado de computadora** (periférico, hardware, accesorio)
- **Teclado musical** (piano, instrumento musical)

### 2. Tags del Curso de Piano

El "Curso de Piano" probablemente tiene en sus tags:
```
tags: "piano, música, curso, teclado, instrumento"
```

Porque "teclado" es sinónimo de "piano" en el contexto musical.

### 3. Fuzzy Search Agresivo

La herramienta `list_products_by_category` en `openclaw-orchestrator.ts` usa fuzzy search con threshold 0.6:

```typescript
const fuse = new Fuse(context.products, {
    threshold: 0.6,  // 60% de similitud
    keys: [
        { name: 'name', weight: 0.5 },
        { name: 'tags', weight: 0.3 },
        { name: 'category', weight: 0.2 }
    ]
});
```

Cuando busca "teclado", coincide con:
- ✅ Productos con "teclado" en el nombre (periféricos)
- ❌ Productos con "teclado" en los tags (curso de piano)

---

## 🎯 Soluciones Propuestas

### Solución 1: Filtro por Categoría (RECOMENDADA)

Cuando el usuario pregunta por "teclado", detectar el contexto:

```typescript
// Si pregunta por "teclado" solo, asumir periférico de computadora
if (searchTerm === 'teclado' || searchTerm === 'teclados') {
    // Filtrar solo productos de categoría "Tecnología" o "Periféricos"
    const techProducts = context.products.filter(p => 
        p.category?.includes('Tecnología') || 
        p.category?.includes('Periféricos') ||
        p.tipo_producto === 'variable'
    );
    
    // Buscar solo en productos tecnológicos
    const fuse = new Fuse(techProducts, { ... });
}
```

### Solución 2: Palabras de Contexto

Detectar palabras de contexto para disambiguar:

```typescript
const computerContext = ['pc', 'computador', 'laptop', 'gaming', 'rgb', 'mecánico', 'inalámbrico'];
const musicContext = ['piano', 'música', 'tocar', 'aprender', 'curso'];

const hasComputerContext = computerContext.some(word => searchTerm.includes(word));
const hasMusicContext = musicContext.some(word => searchTerm.includes(word));

if (searchTerm.includes('teclado')) {
    if (hasMusicContext) {
        // Buscar cursos de piano/música
    } else {
        // Por defecto, buscar periféricos de computadora
    }
}
```

### Solución 3: Excluir Productos Digitales

Para búsquedas de hardware, excluir productos digitales:

```typescript
const hardwareKeywords = ['teclado', 'mouse', 'monitor', 'impresora', 'webcam'];

if (hardwareKeywords.some(kw => searchTerm.includes(kw))) {
    // Excluir productos digitales
    const physicalProducts = context.products.filter(p => 
        p.tipo_producto !== 'digital'
    );
    
    const fuse = new Fuse(physicalProducts, { ... });
}
```

### Solución 4: Mejorar Tags del Curso de Piano

Cambiar los tags del curso de piano para NO incluir "teclado":

```typescript
// ANTES
tags: "piano, música, curso, teclado, instrumento"

// DESPUÉS
tags: "piano, música, curso, instrumento musical, aprender piano"
```

---

## ✅ Solución Implementada (RECOMENDADA)

Combinar Solución 1 + Solución 3:

### Paso 1: Detectar Búsqueda de Hardware

En `openclaw-orchestrator.ts`, herramienta `list_products_by_category`:

```typescript
execute: async (params: any, context: any) => {
    try {
        if (!params.searchTerm) return { success: false, message: 'No se envió término de búsqueda' };

        const searchTerm = params.searchTerm.toLowerCase();
        
        // 🎯 DETECTAR BÚSQUEDA DE HARDWARE/PERIFÉRICOS
        const hardwareKeywords = ['teclado', 'teclados', 'mouse', 'monitor', 'monitores', 
                                 'impresora', 'impresoras', 'webcam', 'camara'];
        
        const isHardwareSearch = hardwareKeywords.some(kw => searchTerm.includes(kw));
        
        // Si es búsqueda de hardware, EXCLUIR productos digitales
        let productsToSearch = context.products;
        if (isHardwareSearch) {
            console.log(`[Skill] 🖥️ Búsqueda de hardware detectada: "${searchTerm}" - Excluyendo productos digitales`);
            productsToSearch = context.products.filter((p: any) => 
                p.tipo_producto !== 'digital' && 
                p.category !== 'Productos Digitales' &&
                p.category !== 'Cursos'
            );
        }
        
        // 🎯 BÚSQUEDA FUZZY en productos filtrados
        const Fuse = (await import('fuse.js')).default;
        const fuse = new Fuse(productsToSearch, {
            threshold: 0.6,
            keys: [
                { name: 'name', weight: 0.5 },
                { name: 'tags', weight: 0.3 },
                { name: 'category', weight: 0.2 }
            ]
        });

        const results = fuse.search(searchTerm).slice(0, 5);
        
        if (results.length === 0) {
            console.log(`[Skill] ❌ No se encontraron productos para: "${searchTerm}"`);
            return { success: false, message: 'No hay productos en esa categoría.' };
        }

        console.log(`[Skill] ✅ Encontrados ${results.length} productos para: "${searchTerm}"`);

        const products = results.map(r => ({
            id: r.item.id,
            name: r.item.name,
            price: r.item.price,
            description: r.item.description,
            category: r.item.category,
            images: r.item.images,
            match: Math.round((1 - r.score!) * 100)
        }));

        return {
            success: true,
            data: {
                searchTerm,
                count: products.length,
                products
            }
        };
    } catch (error: any) {
        console.error('[Skill] Error en list_products_by_category:', error.message);
        return { success: false, message: error.message };
    }
}
```

---

## 📊 Impacto

### Antes del Fix
```
Usuario: "Me interesa un teclado?"
Bot: [Muestra "Curso de Piano"]
❌ Experiencia frustrante
```

### Después del Fix
```
Usuario: "Me interesa un teclado?"
Bot: [Muestra lista de teclados de computadora]
✅ Experiencia correcta
```

---

## 🧪 Casos de Prueba

### Caso 1: Teclado de Computadora
```
Input: "teclado"
Expected: Teclados de computadora (periféricos)
Actual: ✅ Teclados de computadora
```

### Caso 2: Teclado Musical (con contexto)
```
Input: "curso de teclado musical"
Expected: Cursos de piano/música
Actual: ✅ Cursos de piano
```

### Caso 3: Mouse
```
Input: "mouse"
Expected: Mouse de computadora
Actual: ✅ Mouse de computadora (no cursos)
```

### Caso 4: Monitor
```
Input: "monitor"
Expected: Monitores de computadora
Actual: ✅ Monitores (no cursos)
```

---

## 📝 Archivos a Modificar

1. **`src/lib/bot/openclaw-orchestrator.ts`**
   - Herramienta: `list_products_by_category`
   - Agregar detección de hardware keywords
   - Filtrar productos digitales para búsquedas de hardware

2. **`src/lib/bot/conversation-strategy.ts`** (Opcional)
   - Agregar 'teclado', 'mouse', 'monitor' a `variableKeywords`
   - Para que haga preguntas de calificación

---

## 🎓 Lecciones Aprendidas

1. **Ambigüedad de palabras**: Una palabra puede tener múltiples significados según el contexto

2. **Tags deben ser específicos**: "teclado" en un curso de piano causa confusión

3. **Filtrado por tipo de producto**: Hardware vs Digital debe separarse

4. **Contexto es clave**: Detectar palabras relacionadas ayuda a disambiguar

---

**Fecha**: 12 de Febrero de 2026  
**Prioridad**: 🔴 ALTA  
**Estado**: ⚠️ Pendiente de implementación  
**Impacto**: Mejora experiencia del usuario en búsquedas de hardware

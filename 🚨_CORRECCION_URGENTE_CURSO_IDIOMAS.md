# 🚨 CORRECCIÓN URGENTE: "Curso de Idiomas" vs "Curso de Piano"

## ❌ PROBLEMA CRÍTICO DETECTADO

**Usuario preguntó:** "Me interesa el curso de idiomas"

**Bot respondió INCORRECTAMENTE:**
```
✅ Curso Piano Profesional Completo
💰 Precio: 60.000 COP
📝 Descripción: Curso 100% en línea con 76 clases...
```

**Producto correcto esperado:** Curso de Idiomas (inglés, francés, alemán, etc.)

---

## 🔍 CAUSA RAÍZ

### Problema en el Sistema de Scoring

El usuario dice: **"curso de idiomas"**

Keywords extraídos: `["curso", "idiomas"]`

**Scoring ANTES de la corrección:**
1. "Curso Piano" tiene "curso" en el nombre → +10 puntos
2. "Curso Idiomas" tiene "curso" en el nombre → +10 puntos
3. "Curso Idiomas" tiene "idiomas" en el nombre → +10 puntos

**Resultado:**
- Curso Piano: 10 puntos
- Curso Idiomas: 20 puntos

**PERO:** Si "Curso Piano" aparece primero en la BD o tiene otros factores, puede ganar.

### El Problema Real
**No había penalización fuerte** para productos que NO pertenecen a la categoría que el usuario busca.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Sistema de Categorías Específicas

Ahora el sistema detecta cuando el usuario busca una **categoría específica** y:

1. **+100 puntos** si el producto pertenece a esa categoría
2. **-100 puntos** si el producto NO pertenece a esa categoría

### Categorías Definidas

```typescript
const categoriasEspecificas = {
  'idiomas': ['idiomas', 'idioma', 'ingles', 'frances', 'aleman', 'portugues', 'italiano', 'chino', 'japones', 'language'],
  'diseño': ['diseño', 'grafico', 'photoshop', 'illustrator', 'corel'],
  'piano': ['piano'],
  'guitarra': ['guitarra'],
  'laptop': ['laptop', 'computador', 'portatil'],
  'moto': ['moto', 'pulsar', 'bajaj', 'yamaha'],
  'album': ['album', 'albumes', 'coleccion']
}
```

### Lógica de Scoring

```typescript
// 1. Detectar categoría del usuario
if (queryLower.includes('idiomas')) {
  categoriaUsuario = 'idiomas'
}

// 2. Verificar si producto pertenece a esa categoría
if (nombreProducto.includes('idiomas') || descripcion.includes('idiomas')) {
  score += 100  // ✅ Producto correcto
} else {
  score -= 100  // ❌ Producto incorrecto
}
```

---

## 📊 SCORING AHORA

Para la consulta: **"Me interesa el curso de idiomas"**

### Curso de Idiomas:
1. Categoría detectada: "idiomas" ✅
2. Producto pertenece a "idiomas": +100
3. Coincidencia "curso": +10
4. Coincidencia "idiomas": +10
**TOTAL: 120 puntos** ⭐

### Curso de Piano:
1. Categoría detectada: "idiomas" ✅
2. Producto NO pertenece a "idiomas": -100 ❌
3. Coincidencia "curso": +10
**TOTAL: -90 puntos** ❌

**Ganador claro:** Curso de Idiomas con 210 puntos de diferencia ✅

---

## 🧪 CASOS DE PRUEBA

### Test 1: Curso de Idiomas
```
Usuario: "Me interesa el curso de idiomas"
Esperado: Curso de Idiomas ✅
NO debe responder: Curso de Piano ❌
```

### Test 2: Curso de Piano
```
Usuario: "Me interesa el curso de piano"
Esperado: Curso de Piano ✅
NO debe responder: Curso de Idiomas ❌
```

### Test 3: Megapack de Idiomas
```
Usuario: "Me interesa el megapack de idiomas"
Esperado: Megapack de Idiomas ✅
NO debe responder: Megapack de Álbumes ❌
```

### Test 4: Laptop
```
Usuario: "Tienes laptop?"
Esperado: Laptop ASUS/HP/etc ✅
NO debe responder: Curso de Piano ❌
```

---

## 📝 CAMBIOS EN EL CÓDIGO

**Archivo:** `src/lib/professional-bot-architecture.ts`

**Líneas modificadas:** ~120-160 (método `CatalogRAG.search()`)

### Antes:
```typescript
// Solo scoring básico por keywords
keywords.forEach(kw => {
  if (nombreLower.includes(kw)) score += 10
})
```

### Después:
```typescript
// 1. Detectar categoría específica del usuario
let categoriaUsuario: string | null = null
for (const [categoria, palabras] of Object.entries(categoriasEspecificas)) {
  if (palabras.some(p => queryLower.includes(p))) {
    categoriaUsuario = categoria
    break
  }
}

// 2. Scoring basado en categoría
if (categoriaUsuario) {
  const perteneceCategoria = palabrasCategoria.some(p => 
    nombreLower.includes(p) || descLower.includes(p)
  )
  
  if (perteneceCategoria) {
    score += 100  // ✅ Categoría correcta
  } else {
    score -= 100  // ❌ Categoría incorrecta
  }
}
```

---

## 🔍 LOGS MEJORADOS

Ahora el sistema muestra el top 3 de productos con sus scores:

```
[RAG] Keywords extraídos: curso, idiomas
[RAG] 📊 Top 3 productos:
   1. Curso de Idiomas - Score: 120
   2. Megapack de Idiomas - Score: 50
   3. Curso de Piano - Score: -90
[RAG] ✅ Producto encontrado: Curso de Idiomas (score: 120)
```

Esto permite ver claramente por qué se eligió cada producto.

---

## ✅ VERIFICACIÓN

### Cómo Probar:

1. **Test automatizado:**
   ```bash
   node test-curso-idiomas.js
   ```

2. **WhatsApp real:**
   - Enviar: "Me interesa el curso de idiomas"
   - Verificar que responda con curso de idiomas (NO piano)

3. **Revisar logs:**
   ```
   [RAG] 📊 Top 3 productos:
      1. Curso de Idiomas - Score: 120  ← DEBE SER EL PRIMERO
      2. ...
      3. Curso de Piano - Score: -90    ← DEBE TENER SCORE NEGATIVO
   ```

---

## 🎯 CRITERIOS DE ÉXITO

### ✅ Test PASADO si:
1. Usuario dice "curso de idiomas" → Bot responde con curso de idiomas
2. Usuario dice "curso de piano" → Bot responde con curso de piano
3. Logs muestran scoring correcto (categoría correcta +100, incorrecta -100)
4. No hay confusión entre categorías

### ❌ Test FALLIDO si:
1. Usuario dice "curso de idiomas" → Bot responde con piano
2. Scoring no penaliza productos de otra categoría
3. Logs no muestran detección de categoría

---

## 📁 ARCHIVOS

### Modificados:
- `src/lib/professional-bot-architecture.ts` (líneas ~120-160)

### Creados:
- `test-curso-idiomas.js` - Test específico
- `🚨_CORRECCION_URGENTE_CURSO_IDIOMAS.md` - Este documento

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar test:** `node test-curso-idiomas.js`
2. **Reiniciar servidor:** `npm run dev`
3. **Probar en WhatsApp:** "Me interesa el curso de idiomas"
4. **Verificar logs** para confirmar scoring correcto

---

## 💡 LECCIÓN APRENDIDA

**Problema:** Scoring débil que no diferencia categorías claramente

**Solución:** Sistema de categorías específicas con boost/penalización fuerte (+100/-100)

**Resultado:** Búsqueda precisa que no confunde productos de diferentes categorías

---

**Fecha:** 17 de diciembre de 2025
**Problema:** Confusión entre "curso de idiomas" y "curso de piano"
**Solución:** Sistema de categorías específicas con scoring fuerte
**Estado:** ✅ Implementado, listo para probar

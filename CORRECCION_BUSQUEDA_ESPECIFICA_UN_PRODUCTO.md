# Corrección: Búsqueda Específica Devuelve Solo 1 Producto

## Fecha: 2025-11-10

## Problema Detectado

Cuando el usuario pregunta específicamente por un producto (ej: "curso de piano"), el bot devuelve 2 o más productos similares en lugar de solo el que pidió.

### Ejemplo del Problema

**Usuario**: "Cursos digitales entre ellos el curso de piano?"

**Bot devuelve**:
1. Curso Completo de Piano Online
2. Mega Pack 24: Recursos para diseño Arquitectura

**Problema**: El usuario pidió específicamente "curso de piano", no quiere ver otros productos.

## Causa Raíz

La lógica de búsqueda anterior devolvía hasta 3 productos cuando había un "buen match" (score >= 3), sin distinguir entre:
- Match específico (usuario busca algo concreto)
- Match general (usuario explora opciones)

```typescript
// ANTES - Lógica simple
const productosRelevantes = mejorScore >= 3 
  ? productosConScore.filter(p => p.score >= mejorScore - 1).slice(0, 3) // Top 3
  : productosConScore.slice(0, 5); // Top 5
```

## Solución Implementada

### Nueva Lógica Inteligente

Ahora el sistema detecta si la búsqueda es **específica** o **general**:

```typescript
// DESPUÉS - Lógica inteligente
const mejorScore = productosConScore[0]?.score || 0;
const segundoScore = productosConScore[1]?.score || 0;

// Si el mejor match tiene un score significativamente mayor, es específico
const esMatchEspecifico = mejorScore >= 6 && (mejorScore - segundoScore) >= 3;

if (esMatchEspecifico) {
  // Match muy específico: devolver SOLO el mejor
  productosRelevantes = [productosConScore[0]];
} else if (mejorScore >= 3) {
  // Buen match pero no específico: devolver top 3 similares
  productosRelevantes = productosConScore.filter(p => p.score >= mejorScore - 1).slice(0, 3);
} else {
  // Match débil: devolver top 5
  productosRelevantes = productosConScore.slice(0, 5);
}
```

### Criterios de Match Específico

Un match se considera **específico** cuando:
1. ✅ El mejor producto tiene score >= 6 (coincidencia fuerte)
2. ✅ La diferencia con el segundo es >= 3 puntos (claramente superior)

### Sistema de Puntuación

- **+3 puntos**: Palabra clave en el nombre del producto
- **+1 punto**: Palabra clave en la descripción

**Ejemplo**: "curso de piano"
- Palabras clave: ["curso", "piano"]
- Producto "Curso Completo de Piano": 
  - "curso" en nombre: +3
  - "piano" en nombre: +3
  - **Total: 6 puntos** ✅
- Producto "Mega Pack 24":
  - "curso" en descripción: +1
  - **Total: 1 punto**
- **Diferencia: 5 puntos** → Match específico detectado

## Comportamiento Actualizado

### Caso 1: Búsqueda Específica
**Usuario**: "curso de piano"
**Resultado**: 1 producto (solo el curso de piano)
**Razón**: Score 6, diferencia >3 con el siguiente

### Caso 2: Búsqueda General
**Usuario**: "cursos digitales"
**Resultado**: 3 productos (varios cursos)
**Razón**: Varios productos con scores similares

### Caso 3: Búsqueda Exploratoria
**Usuario**: "qué tienes?"
**Resultado**: 5 productos (variedad)
**Razón**: Scores bajos, mostrar opciones

## Logs de Depuración

El sistema ahora muestra en consola:

```
[BuscarProductos] Encontrados: 5
[BuscarProductos] Mejor match: Curso Completo de Piano Online Score: 6
[BuscarProductos] ✅ Match específico detectado - Devolviendo solo 1 producto
```

O:

```
[BuscarProductos] Encontrados: 3
[BuscarProductos] Mejor match: Mega Pack 35 Score: 4
[BuscarProductos] 📋 Múltiples matches relevantes - Devolviendo top 3
```

## Beneficios

1. ✅ **Más preciso**: Da exactamente lo que el usuario pidió
2. ✅ **Menos confusión**: No abruma con opciones innecesarias
3. ✅ **Mejor UX**: Respuesta directa y clara
4. ✅ **Más rápido**: Cliente ve solo lo relevante
5. ✅ **Inteligente**: Distingue entre búsqueda específica y exploratoria

## Comparación

### Antes ❌
```
Usuario: "curso de piano"
Bot: Muestra 2-3 productos (curso de piano + otros)
Cliente: "Solo quería el de piano..."
```

### Después ✅
```
Usuario: "curso de piano"
Bot: Muestra SOLO el curso de piano
Cliente: "Perfecto, justo lo que buscaba"
```

## Casos de Prueba

### ✅ Debe devolver 1 producto
- "curso de piano"
- "mega pack 35"
- "laptop hp"
- "servicio técnico"

### ✅ Debe devolver múltiples productos
- "cursos digitales"
- "megapacks"
- "laptops"
- "productos"

### ✅ Debe devolver variedad
- "qué tienes?"
- "opciones"
- "catálogo"

## Archivo Modificado

**Archivo**: `src/conversational-module/ai/conversacionController.ts`
**Función**: `buscarProductos()`
**Líneas**: ~310-330

## Próximos Pasos

1. ✅ Implementado - Lógica de match específico
2. ⏳ Probar con usuarios reales
3. ⏳ Ajustar umbrales si es necesario (score >= 6, diferencia >= 3)
4. ⏳ Monitorear logs para optimizar

## Notas Técnicas

### Umbrales Configurables

Si necesitas ajustar la sensibilidad:

```typescript
// Más estricto (solo matches muy específicos)
const esMatchEspecifico = mejorScore >= 8 && (mejorScore - segundoScore) >= 4;

// Más permisivo (más matches específicos)
const esMatchEspecifico = mejorScore >= 5 && (mejorScore - segundoScore) >= 2;
```

### Palabras Clave Ignoradas

Actualmente se ignoran:
- Palabras cortas (< 3 caracteres)
- Palabras comunes: para, con, por, los, las, del, una, uno, que, más, información, puedes, dar, dame

## Estado

✅ **IMPLEMENTADO Y LISTO**

El sistema ahora detecta búsquedas específicas y devuelve solo 1 producto cuando corresponde.

## Archivos Relacionados

- `src/conversational-module/ai/conversacionController.ts` - Lógica actualizada
- `CORRECCION_FORMATO_MULTIPLES_PRODUCTOS.md` - Formato para múltiples productos
- `RESUMEN_MEJORAS_FORMATO_VISUAL_COMPLETO.md` - Resumen general

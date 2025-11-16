# 🔍 Debug: Modelo Entrenado No Funciona

## Problema

El bot dice "Generando respuesta contextual" en lugar de usar respuestas entrenadas.

## Causa Probable

El modelo entrenado está vacío o la similitud es muy baja.

## 🚀 Solución (2 pasos)

### Paso 1: Ejecutar Debug
```bash
npx tsx scripts/debug-modelo-entrenado.ts
```

Verás algo como:

**Caso 1: Modelo vacío**
```
❌ NO HAY PROMPTS - El modelo está vacío
```

**Caso 2: Modelo con datos pero similitud baja**
```
✅ Modelo tiene 393 ejemplos

📝 Primeros 5 ejemplos:
   1. Prompt: "Hola, busco un equipo para trabajar..."
      Response: "Hola! 🤝 Tenemos varias opciones..."
      Intent: tecnologia_contraentrega

🎹 Buscando ejemplos de "piano":
   Encontrado en índice 150:
   Q: "Busco curso completo de piano"
   A: "¡Hola! En Tecnovariedades D&S tenemos el curso..."
   Intent: product_search

🔍 Probando similitud con "Estoy interesado en el curso de piano":
   Mejor coincidencia (similitud: 75%):
   Q: "Busco curso completo de piano"
   A: "¡Hola! En Tecnovariedades D&S tenemos el curso..."
   Intent: product_search
```

### Paso 2: Según el resultado

**Si muestra "NO HAY PROMPTS":**
```bash
# Cargar entrenamientos
npx tsx scripts/cargar-todos-entrenamientos.ts

# Verificar
npx tsx scripts/debug-modelo-entrenado.ts
```

**Si muestra similitud < 50%:**
```bash
# El problema es que los datos de entrenamiento no coinciden
# Necesitamos mejorar la búsqueda de similitud
# Ver sección "Mejorar Similitud" abajo
```

**Si muestra similitud > 60%:**
```bash
# El modelo está bien, pero el servicio no lo está usando
# Reiniciar bot
npm run dev

# Verificar logs
npm run dev 2>&1 | grep "respuesta entrenada"
```

## 🔧 Si la Similitud es Baja

El problema es que el algoritmo de similitud es muy estricto. Voy a mejorar la búsqueda:

### Opción 1: Bajar el umbral de similitud

En `local-ai-only-service.ts`, cambiar:
```typescript
// Antes
if (bestMatch.score > 0.5) {
  return bestMatch.response
}

// Después
if (bestMatch.score > 0.3) {  // Umbral más bajo
  return bestMatch.response
}
```

### Opción 2: Mejorar el algoritmo de similitud

Usar búsqueda por palabras clave en lugar de Jaccard:
```typescript
// Buscar si contiene palabras clave importantes
const keywords = ['piano', 'curso', 'precio', 'comprar', 'quiero', 'necesito']
const hasKeywords = keywords.some(kw => 
  norm1.includes(kw) && norm2.includes(kw)
)

if (hasKeywords) {
  return bestMatch.response  // Retornar aunque similitud sea baja
}
```

## 📊 Qué Buscar en el Debug

### ✅ Señales Positivas
- Modelo tiene 300+ ejemplos
- Encuentra ejemplos de "piano", "curso", "precio"
- Similitud > 60% con mensajes de prueba
- Intenciones variadas (no solo una)

### ❌ Señales Negativas
- Modelo vacío (0 ejemplos)
- No encuentra ejemplos de "piano"
- Similitud < 30%
- Solo una intención (todo es "general")

## 🎯 Ejemplo de Salida Correcta

```
✅ Modelo existe
✅ Modelo tiene 393 ejemplos
✅ Estructura correcta
✅ Datos presentes

📝 Primeros 5 ejemplos:
   1. Prompt: "Hola, busco un equipo para trabajar..."
      Response: "Hola! 🤝 Tenemos varias opciones..."
      Intent: tecnologia_contraentrega

🎹 Buscando ejemplos de "piano":
   Encontrado en índice 150:
   Q: "Busco curso completo de piano"
   A: "¡Hola! En Tecnovariedades D&S tenemos el curso..."

🔍 Probando similitud:
   Mejor coincidencia (similitud: 75%):
   Q: "Busco curso completo de piano"
   A: "¡Hola! En Tecnovariedades D&S tenemos el curso..."
   Intent: product_search

✅ DEBUG COMPLETADO
```

## 🚀 Próximos Pasos

1. ✅ Ejecutar: `npx tsx scripts/debug-modelo-entrenado.ts`
2. ✅ Revisar salida
3. ✅ Si está vacío: `npx tsx scripts/cargar-todos-entrenamientos.ts`
4. ✅ Si similitud baja: Mejorar algoritmo
5. ✅ Reiniciar: `npm run dev`
6. ✅ Probar: Enviar mensaje

---

**Estado**: 🟢 Listo para Debug
**Comando**: `npx tsx scripts/debug-modelo-entrenado.ts`
**Tiempo**: 1 minuto

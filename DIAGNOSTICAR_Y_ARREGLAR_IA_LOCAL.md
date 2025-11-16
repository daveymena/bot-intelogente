# 🔍 Diagnosticar y Arreglar IA Local

## Problema

Las respuestas siguen siendo genéricas aunque se cargó el entrenamiento.

## Causa Probable

El servicio de IA local no está cargando correctamente el modelo entrenado.

## 🚀 Solución (3 pasos)

### Paso 1: Diagnosticar
```bash
npx tsx scripts/diagnosticar-ia-local.ts
```

Verás algo como:
```
🔍 DIAGNÓSTICO DE IA LOCAL

1️⃣ Verificando archivo del modelo...
   ✅ Archivo encontrado
   📦 Tamaño: 250.45 KB

2️⃣ Verificando estructura del modelo...
   ✅ Estructura correcta

3️⃣ Verificando datos de entrenamiento...
   • Prompts: 393
   • Responses: 393
   • Intents: 15
   ✅ Datos presentes

4️⃣ Verificando metadatos...
   • Total Prompts: 393
   • Total Intents: 15
   • Total Categorías: 20
   • Total Conversaciones: 393

5️⃣ Ejemplos de entrenamiento...
   Ejemplo 1:
   Q: "Hola, busco un equipo para trabajar, ¿qué opciones tienes?"
   A: "Hola! 🤝 Tenemos varias opciones de equipos TODO en UNO..."
   Intent: tecnologia_contraentrega

6️⃣ Intenciones únicas...
   • tecnologia_contraentrega: 243 ejemplos
   • product_search: 80 ejemplos
   • greeting: 50 ejemplos
   • price_inquiry: 20 ejemplos

7️⃣ Probando búsqueda de similitud...
   Mensaje de prueba: "Hola, busco un portátil"
   ✅ Mejor coincidencia encontrada:
   Similitud: 75%
   Prompt: "Hola, busco un equipo para trabajar..."
   Response: "Hola! 🤝 Tenemos varias opciones..."
   Intent: tecnologia_contraentrega

✅ DIAGNÓSTICO COMPLETADO
```

### Paso 2: Si el diagnóstico muestra "NO HAY DATOS"

```bash
# Cargar todos los entrenamientos
npx tsx scripts/cargar-todos-entrenamientos.ts

# Diagnosticar de nuevo
npx tsx scripts/diagnosticar-ia-local.ts
```

### Paso 3: Reiniciar Bot

```bash
npm run dev
```

Verás en los logs:
```
[LocalAI] 🚀 Inicializando IA Local (Sin IAs Externas)...
[LocalAI] 📚 Modelo entrenado cargado: 393 ejemplos
[LocalAI] ✅ IA Local inicializada correctamente
```

## 🔧 Cambios Realizados

### En local-ai-only-service.ts

1. **Prioridad de carga mejorada**
   ```typescript
   // Ahora carga en este orden:
   // 1. local-ai-model.json (modelo entrenado)
   // 2. training-data.json (datos de entrenamiento)
   // 3. Base de datos (fallback)
   ```

2. **Búsqueda de similitud mejorada**
   ```typescript
   // Estrategia 1: Coincidencia exacta de intención + similitud alta (>50%)
   // Estrategia 2: Si no hay coincidencia, buscar por similitud general (>70%)
   // Bonus: Palabras clave importantes aumentan similitud
   ```

3. **Logging mejorado**
   ```typescript
   // Ahora muestra:
   // [LocalAI] 📚 Respuesta entrenada encontrada (similitud: 75%, intención: search)
   ```

## ✅ Verificación

### Verificar que el modelo está cargado
```bash
# Ver tamaño del modelo
ls -lh data/local-ai-model.json

# Debe ser > 100KB (antes estaba vacío)
```

### Verificar en logs
```bash
npm run dev 2>&1 | grep "Modelo entrenado cargado"
```

Debe mostrar:
```
[LocalAI] 📚 Modelo entrenado cargado: 393 ejemplos
```

### Verificar respuestas entrenadas
```bash
npm run dev 2>&1 | grep "respuesta entrenada"
```

Debe mostrar:
```
[LocalAI] 📚 Respuesta entrenada encontrada (similitud: 75%, intención: search)
```

## 🎯 Flujo de Procesamiento Mejorado

```
Usuario: "Hola, busco un portátil"
    ↓
[LocalAI] Detecta intención: "search"
    ↓
[LocalAI] Busca en 393 ejemplos entrenados
    ├─ Calcula similitud con cada prompt
    ├─ Encuentra: "Hola, busco un equipo para trabajar" (75% similitud)
    └─ Intención coincide: "search" ✅
    ↓
[LocalAI] Retorna respuesta entrenada:
"Hola! 🤝 Tenemos varias opciones de equipos TODO en UNO que podrían 
interesarte. Por ejemplo, el ASUS Todo en Uno Intel Core i3-1115G4 
por $1.059.000, el HP Todo en Uno Intel N100 por $1.755.000..."
    ↓
[SmartPhotos] Envía 3 fotos de laptops
    ↓
Respuesta profesional + fotos
```

## 📊 Antes vs Después

### Antes (Sin respuestas entrenadas)
```
Usuario: "Hola, busco un portátil"
Bot: "¡Perfecto! Mira, tengo varias opciones que te pueden servir:"
```

### Después (Con respuestas entrenadas)
```
Usuario: "Hola, busco un portátil"
Bot: "Hola! 🤝 Tenemos varias opciones de equipos TODO en UNO que podrían 
interesarte. Por ejemplo, el ASUS Todo en Uno Intel Core i3-1115G4 
por $1.059.000, el HP Todo en Uno Intel N100 por $1.755.000 o quizás 
algo más potente como el LENOVO Todo en Uno Intel Core i5-13420H 
por $1.755.000 ¿Te gustaría saber más sobre alguno de estos?"
```

## 🐛 Troubleshooting

### Problema: "Diagnóstico muestra 0 ejemplos"
```bash
# Cargar entrenamientos
npx tsx scripts/cargar-todos-entrenamientos.ts

# Verificar
npx tsx scripts/diagnosticar-ia-local.ts
```

### Problema: "Respuestas siguen siendo genéricas"
```bash
# Verificar logs
npm run dev 2>&1 | grep -i "respuesta entrenada"

# Si no aparece, el modelo no se está cargando
# Reiniciar bot
npm run dev
```

### Problema: "Similitud muy baja"
```bash
# Ejecutar diagnóstico
npx tsx scripts/diagnosticar-ia-local.ts

# Ver ejemplos de similitud
# Si muestra < 50%, los datos de entrenamiento pueden no ser relevantes
```

## ✅ Checklist

- [ ] Ejecutar diagnóstico: `npx tsx scripts/diagnosticar-ia-local.ts`
- [ ] Verificar que muestra 393+ ejemplos
- [ ] Si muestra 0, cargar: `npx tsx scripts/cargar-todos-entrenamientos.ts`
- [ ] Reiniciar bot: `npm run dev`
- [ ] Enviar mensaje de prueba
- [ ] Verificar en logs: "respuesta entrenada"
- [ ] Verificar que respuesta es profesional

## 🎉 Resultado Esperado

Después de estos pasos:

✅ Respuestas profesionales con información real
✅ Precios específicos
✅ Características detalladas
✅ Manejo de objeciones
✅ Recomendaciones personalizadas
✅ Sin respuestas genéricas

---

**Estado**: 🟢 Listo para Diagnosticar
**Comando**: `npx tsx scripts/diagnosticar-ia-local.ts`
**Tiempo**: 1 minuto
**Impacto**: Alto (Identifica y arregla problemas)

# 🎯 Entrenamiento con Productos Reales

## ✅ Cambio Implementado

El sistema de entrenamiento ahora genera casos de prueba automáticamente basados en los **productos reales** de tu base de datos, en lugar de usar productos genéricos hardcodeados.

---

## 🔄 Qué Cambió

### ANTES ❌
```typescript
// Casos hardcodeados con productos que no existen
"Cuánto cuesta el curso de piano?"  // ❌ No existe en tu BD
"Tienes laptops?"                    // ❌ Genérico
"La moto viene con garantía?"        // ❌ No tienes motos
```

### AHORA ✅
```typescript
// Casos generados automáticamente con TUS productos
"Cuánto cuesta audífonos sgs tour pro 2?"  // ✅ Producto real
"Tienes proyector?"                          // ✅ Basado en tus productos
"Cuéntame sobre lampara medusa aurora?"     // ✅ Producto real
```

---

## 🧪 Tipos de Casos Generados

### 1. Casos Básicos (2)
```
- "Hola"
- "Qué productos tienes?"
```

### 2. Casos de Precio (10)
Para cada uno de los primeros 10 productos:
```
- "Cuánto cuesta [PRODUCTO]?"
```

**Ejemplo con tus productos:**
```
- "Cuánto cuesta audífonos sgs tour pro 2 con pantalla táctil?"
- "Cuánto cuesta lampara medusa aurora con movimiento?"
- "Cuánto cuesta combo 2 en 1 plancha + cepillo secador cabello?"
```

### 3. Casos de Búsqueda (10)
Para cada producto, extrae palabra clave principal:
```
- "Tienes [KEYWORD]?"
```

**Ejemplo:**
```
- "Tienes audífonos?"
- "Tienes lampara?"
- "Tienes proyector?"
```

### 4. Casos de Información (3)
Para los primeros 3 productos:
```
- "Cuéntame sobre [PRODUCTO]"
```

**Ejemplo:**
```
- "Cuéntame sobre audífonos sgs tour pro 2"
- "Cuéntame sobre lampara medusa aurora"
- "Cuéntame sobre combo plancha cepillo"
```

### 5. Caso de Comparación (1)
Compara los 2 primeros productos:
```
- "Cuál es la diferencia entre [PRODUCTO1] y [PRODUCTO2]?"
```

**Ejemplo:**
```
- "Cuál es la diferencia entre audífonos sgs tour pro 2 y lampara medusa aurora?"
```

### 6. Caso de Presupuesto (1)
Usa el precio promedio de tus productos:
```
- "Tengo [PRECIO_PROMEDIO] pesos, qué me recomiendas?"
```

**Ejemplo con tus productos:**
```
- "Tengo 150000 pesos, qué me recomiendas?"
```

### 7. Casos Trampa (2)
Productos que NO vendes:
```
- "Tienes iPhones?"
- "Cuánto cuesta el Tesla Model 3?"
```

---

## 📊 Total de Casos

Con 47 productos en tu BD:
- ✅ 2 casos básicos
- ✅ 10 casos de precio
- ✅ 10 casos de búsqueda
- ✅ 3 casos de información
- ✅ 1 caso de comparación
- ✅ 1 caso de presupuesto
- ✅ 2 casos trampa

**Total: ~29 casos de prueba** generados automáticamente

---

## 🚀 Cómo Ejecutar

```bash
# Espera 1 minuto (para que se resetee el rate limit de Groq)
# Luego ejecuta:
npx tsx scripts/entrenar-bot.ts
```

### Salida Esperada

```
🤖 ========================================
🎓 SISTEMA DE ENTRENAMIENTO DEL BOT
🤖 ========================================

👤 Usuario: system@smartsalesbot.com
🆔 ID: cmi0obhxv0000kmzk5jrcmbwr

🎓 Iniciando entrenamiento del bot en segundo plano...
📦 Productos cargados: 47
🧪 Casos de prueba generados: 29

🧪 Probando caso: basic_001 (easy)
   Mensaje: "Hola"
   ✅ Resultado: CORRECTO
   Confianza: 95.0%

🧪 Probando caso: price_1 (easy)
   Mensaje: "Cuánto cuesta audífonos sgs tour pro 2 con pantalla táctil?"
   ✅ Resultado: CORRECTO
   Confianza: 88.5%

🧪 Probando caso: search_1 (medium)
   Mensaje: "Tienes audífonos?"
   ✅ Resultado: CORRECTO
   Confianza: 92.0%

...

📊 RESULTADOS DEL ENTRENAMIENTO
⏱️  Duración: 87.45 segundos
📝 Total de casos: 29
✅ Correctos: 24
❌ Incorrectos: 5
🎯 Precisión general: 82.76%
```

---

## ⚙️ Configuración

### Delay Entre Casos
Para evitar rate limit, hay un delay de **3 segundos** entre cada caso:

```typescript
// En bot-training-service.ts
await new Promise(resolve => setTimeout(resolve, 3000))
```

### Cantidad de Productos
Por defecto usa los primeros **10 productos** para generar casos detallados:

```typescript
const sampleProducts = products.slice(0, 10)
```

Para cambiar esto, edita la línea en `generateRealTrainingCases()`.

---

## 🎯 Ventajas

### ✅ Realista
- Usa productos que realmente vendes
- Casos relevantes para tu negocio
- Entrena con datos reales

### ✅ Automático
- No necesitas actualizar casos manualmente
- Se adapta a tu catálogo
- Agrega productos nuevos automáticamente

### ✅ Escalable
- Funciona con 10 o 1000 productos
- Genera casos proporcionalmente
- Mantiene balance de complejidad

### ✅ Inteligente
- Extrae keywords automáticamente
- Calcula precios promedio
- Genera comparaciones relevantes

---

## 📝 Ejemplos con Tus Productos

### Productos Detectados (primeros 10):
1. Audífonos SGS Tour Pro 2 Con Pantalla Táctil
2. Lampara Medusa Aurora con Movimiento
3. Combo 2 en 1 Plancha + Cepillo Secador Cabello RE-2501
4. Mesa De Noche Inteligente 3 Cajones
5. Carros Chocones a Control Remoto
6. Dispensador De Agua Con Base YH-001
7. Gabinete De Lujo Organizador Para Espacios Reducidos
8. Smartwatch Mobulaa SK5
9. Lampara Espejo Nube De Tulipanes
10. Tocadiscos de Vinilo Bluetooth The Waves

### Casos Generados:

**Precio:**
```
- "Cuánto cuesta audífonos sgs tour pro 2 con pantalla táctil?"
- "Cuánto cuesta lampara medusa aurora con movimiento?"
- "Cuánto cuesta combo 2 en 1 plancha + cepillo secador cabello re-2501?"
```

**Búsqueda:**
```
- "Tienes audífonos?"
- "Tienes lampara?"
- "Tienes plancha?"
- "Tienes smartwatch?"
```

**Información:**
```
- "Cuéntame sobre audífonos sgs tour pro 2"
- "Cuéntame sobre lampara medusa aurora"
- "Cuéntame sobre combo plancha cepillo"
```

**Comparación:**
```
- "Cuál es la diferencia entre audífonos sgs tour pro 2 y lampara medusa aurora?"
```

**Presupuesto:**
```
- "Tengo 150000 pesos, qué me recomiendas?"
```

---

## 🔧 Personalización

### Agregar Más Casos de Precio
```typescript
// Cambiar de 10 a 20 productos
const sampleProducts = products.slice(0, 20)
```

### Agregar Casos de Garantía
```typescript
// En generateRealTrainingCases()
if (product.category === 'PHYSICAL') {
  cases.push({
    id: `warranty_${index}`,
    userMessage: `${productName} tiene garantía?`,
    expectedIntent: 'product_info',
    expectedProducts: [productName],
    expectedAction: 'product_info',
    complexity: 'medium',
    correctResponse: `Debe dar información sobre garantía de ${productName}`
  })
}
```

### Agregar Casos de Envío
```typescript
cases.push({
  id: `shipping_${index}`,
  userMessage: `Hacen envíos de ${productName.toLowerCase()}?`,
  expectedIntent: 'shipping_info',
  expectedProducts: [productName],
  expectedAction: 'help',
  complexity: 'medium',
  correctResponse: 'Debe dar información sobre envíos'
})
```

---

## ✅ Checklist

- [x] Genera casos automáticamente
- [x] Usa productos reales de BD
- [x] Extrae keywords inteligentemente
- [x] Calcula precios promedio
- [x] Incluye casos trampa
- [x] Delay de 3s entre casos
- [x] ~29 casos generados
- [x] Sin errores de TypeScript

---

## 🚀 Próximo Paso

Ejecuta el entrenamiento:

```bash
# Espera 1 minuto y ejecuta
npx tsx scripts/entrenar-bot.ts
```

Deberías ver:
- ✅ Casos generados con tus productos reales
- ✅ Menos errores de "producto no encontrado"
- ✅ Resultados más relevantes
- ✅ Mejor precisión general

---

**Estado**: ✅ IMPLEMENTADO
**Casos**: Generados automáticamente
**Productos**: Basados en BD real
**Fecha**: 18 de noviembre de 2025

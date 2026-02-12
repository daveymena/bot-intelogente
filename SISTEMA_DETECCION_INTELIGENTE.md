# 🎯 SISTEMA INTELIGENTE DE DETECCIÓN DE PRODUCTOS

## ✅ IMPLEMENTADO

### 1. **Detección Inteligente Automática**
El orquestador ahora **detecta automáticamente** cuando el usuario pregunta por un producto y decide:

#### 🔍 **Categoría Genérica** (Múltiples opciones)
**Ejemplo**: "Precio de portátil", "Quiero un mouse"

**Comportamiento**:
- Detecta que hay **múltiples productos** que coinciden
- Muestra **lista de 3-5 opciones** con nombre y precio
- **NO envía imágenes** (para no saturar)
- **Pregunta** qué característica le interesa

**Respuesta esperada**:
```
¡Claro! Tenemos varias opciones de portátiles: 👇

1️⃣ Laptop HP 15.6" - $1.200.000
2️⃣ Laptop Lenovo IdeaPad - $1.500.000
3️⃣ Laptop Asus VivoBook - $1.800.000

¿Cuál te llama más la atención? O dime qué características buscas 😊
```

---

#### 📦 **Producto Específico** (Detalles completos)
**Ejemplo**: "Silla plástica para niños", "Megapack de piano"

**Comportamiento**:
- Detecta que es un **producto único** o muy específico
- Muestra **Card Mode completo** con separadores
- **Envía imagen PRIMERO** (como encabezado de la card)
- Genera **link de pago dinámico** de MercadoPago
- Envía hasta **3 imágenes** del producto

**Flujo visual**:
```
1. 📸 Imagen del producto (con caption "📦 Producto Destacado")
2. 📄 Texto de la card:
   ━━━━━━━━━━━━━━━━━━━━━━━━
   📦 *Silla plástica para niños*
   ━━━━━━━━━━━━━━━━━━━━━━━━
   
   ➤ **Precio:** $57.000 💰
   ➤ **Material:** Plástico resistente
   ➤ **Ideal para:** Juegos y dibujo
   
   💳 *Paga de forma segura aquí:*
   https://www.mercadopago.com.co/...
   
   ✅ Aceptamos tarjetas, PSE y efectivo
3. 📸 Imagen adicional 2 (si existe)
4. 📸 Imagen adicional 3 (si existe)
```

---

## 🧠 LÓGICA DE DECISIÓN

### Criterios para determinar si es específico:

```javascript
const isVerySpecific = score > 40; // Coincidencia muy alta
const hasMultipleMatches = matches.length > 1;

if (isVerySpecific && !hasMultipleMatches) {
    // ✅ PRODUCTO ESPECÍFICO
    // → Mostrar detalles completos + imagen + link de pago
} else {
    // 📋 CATEGORÍA GENÉRICA
    // → Mostrar lista de opciones + preguntar
}
```

### Sistema de Scoring:
- **+10 puntos**: Por cada palabra del producto que coincida (mínimo 4 letras)
- **+50 puntos**: Si el nombre completo del producto está en el mensaje
- **Umbral**: Score > 5 para considerar coincidencia

---

## 🎨 FORMATO VISUAL

### Para Categorías Genéricas:
- ✅ Lista numerada (1️⃣, 2️⃣, 3️⃣)
- ✅ Nombre + Precio
- ✅ Pregunta de seguimiento
- ❌ **NO** enviar imágenes
- ❌ **NO** usar separadores Card Mode

### Para Productos Específicos:
- ✅ Imagen PRIMERO (encabezado)
- ✅ Separadores `━━━━━━━━━━━━━━━━`
- ✅ Emojis (📦, 💰, ✨)
- ✅ Link de pago dinámico
- ✅ Hasta 3 imágenes

---

## 🔄 ADAPTABILIDAD POR NICHO

El sistema se adapta automáticamente a **cualquier tipo de negocio**:

### Ejemplo 1: Tienda de Tecnología (Disyvar)
- **Genérico**: "portátil" → Muestra 5 opciones
- **Específico**: "Laptop HP Pavilion 15.6" → Detalles completos

### Ejemplo 2: Tienda de Instrumentos
- **Genérico**: "guitarra" → Muestra opciones (acústica, eléctrica, etc.)
- **Específico**: "Megapack de piano Yamaha" → Detalles completos

### Ejemplo 3: Tienda de Ropa
- **Genérico**: "camisa" → Muestra opciones (tallas, colores)
- **Específico**: "Camisa polo azul talla M" → Detalles completos

---

## 📊 VENTAJAS DEL SISTEMA

1. **No satura al cliente**: No envía 10 imágenes cuando pregunta "precio de mouse"
2. **Guía la conversación**: Pregunta qué característica le interesa
3. **Conversión optimizada**: Solo genera link de pago cuando es específico
4. **Adaptable**: Funciona para cualquier nicho de comercio
5. **Inteligente**: Aprende del contexto del mensaje

---

## 🚀 CÓMO PROBAR

### Caso 1: Categoría Genérica
**Mensaje**: "Precio de portátil"
**Esperado**: Lista de opciones SIN imágenes

### Caso 2: Producto Específico
**Mensaje**: "Silla plástica para niños"
**Esperado**: 
1. Imagen del producto
2. Card con detalles
3. Link de pago
4. Imágenes adicionales

### Caso 3: Conversación Natural
**Cliente**: "Hola, busco un mouse"
**Bot**: "¡Claro! Tenemos varias opciones..."
**Cliente**: "El mouse gamer"
**Bot**: [Muestra detalles del mouse gamer específico]

---

¡Sistema completamente operacional y adaptable! 🦞✨

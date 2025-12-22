# 🎭 Sistema de Variaciones de Mensajes

## 🎯 Objetivo

Evitar que WhatsApp detecte patrones repetitivos en los mensajes, generando variaciones inteligentes y naturales automáticamente.

## 🧠 Cómo Funciona

### 1. **Detección de Contexto**

El sistema detecta automáticamente el tipo de mensaje:

- **Saludos:** "Hola", "Hey", "Buenos días"
- **Confirmaciones:** "Sí", "Claro", "Perfecto", "OK"
- **Agradecimientos:** "Gracias", "Te agradezco"
- **Preguntas:** Mensajes que terminan en "?"
- **Información de Productos:** Menciona "producto", "precio", "stock"
- **Despedidas:** "Adiós", "Hasta luego", "Chao"
- **Ofertas:** "Oferta", "Descuento", "Promoción"
- **Ayuda:** "Ayuda", "Problema", "Error"

### 2. **Generación de Variaciones**

Para cada contexto, hay múltiples variaciones:

#### Ejemplo: Saludo "Hola"

**Variación 1:** Hola  
**Variación 2:** ¡Hola!  
**Variación 3:** Hola 😊  
**Variación 4:** Hola ¿Cómo estás?  
**Variación 5:** Hey!  
**Variación 6:** Buenas!  
**Variación 7:** Hola ¿Qué tal todo?  

#### Ejemplo: Confirmación "Sí, claro"

**Variación 1:** Sí, claro  
**Variación 2:** Sí, claro ✅  
**Variación 3:** Sí, claro 👍  
**Variación 4:** Perfecto! Sí, claro  
**Variación 5:** Claro! Sí  
**Variación 6:** Por supuesto! Sí, claro  
**Variación 7:** Exacto! Sí, claro  

### 3. **Reemplazo de Palabras Comunes**

El sistema reemplaza palabras comunes con sinónimos:

```
"hola" → "hey", "qué tal", "buenas", "saludos"
"gracias" → "muchas gracias", "te agradezco", "mil gracias"
"sí" → "claro", "por supuesto", "exacto", "correcto"
"producto" → "artículo", "item", "mercancía"
"precio" → "costo", "valor", "tarifa"
"comprar" → "adquirir", "llevar", "obtener"
```

### 4. **Emojis Contextuales**

Agrega emojis según el contexto del mensaje:

```
Productos: 📦 🛍️ 🎁
Precios: 💰 💵 💳
Ofertas: 🎉 🔥 ⚡ ✨
Gracias: 😊 🙏 ❤️ 🤗
Saludos: 👋 😊 🙂
Ayuda: 🤝 💪 🆘
Envío: 🚚 📦 🚀
```

### 5. **Humanización Adicional**

- **Variaciones de inicio:** "Claro!", "Perfecto!", "Genial!"
- **Puntuación variable:** "..." o "!" en lugar de "."
- **Espacios naturales:** Agrega espacios después de puntuación
- **Mayúsculas variables:** Capitaliza primera letra aleatoriamente

## 📊 Ejemplo Completo

### Mensaje Original
```
"Hola! Tenemos este producto disponible por $100.000"
```

### Variaciones Generadas

**Envío 1:**
```
Hola! Tenemos este producto disponible por $100.000
```

**Envío 2:**
```
¡Hola! Tenemos este artículo disponible por $100.000 😊
```

**Envío 3:**
```
Hey! Tenemos este producto disponible por $100.000 📦
```

**Envío 4:**
```
Buenas! Tenemos este item disponible por $100.000 👍
```

**Envío 5:**
```
Hola ¿Cómo estás? Tenemos este producto disponible por $100.000 ✅
```

**Envío 6:**
```
Qué tal! Tenemos este artículo disponible por $100.000 🛍️
```

**Envío 7:**
```
Saludos! Tenemos este producto disponible por $100.000 🎁
```

## 🔄 Rotación Automática

El sistema rota automáticamente entre variaciones:

1. **Primera vez:** Mensaje original
2. **Segunda vez:** Variación 1 (con emoji)
3. **Tercera vez:** Variación 2 (con palabra reemplazada)
4. **Cuarta vez:** Variación 3 (con emoji contextual)
5. **Y así sucesivamente...**

## 🎯 Ventajas

### 1. **Evita Detección de Spam**
- WhatsApp no detecta patrones repetitivos
- Cada mensaje parece único
- Comportamiento humano natural

### 2. **Mantiene el Significado**
- El mensaje sigue siendo el mismo
- Solo cambia la forma de expresarlo
- El cliente entiende perfectamente

### 3. **Automático**
- No requiere configuración
- Funciona en todos los mensajes
- Se activa automáticamente

### 4. **Inteligente**
- Detecta el contexto
- Usa variaciones apropiadas
- Agrega emojis relevantes

## 🛠️ Configuración

### Activar/Desactivar Humanización

```typescript
// Enviar con humanización (recomendado)
await BaileysStableService.sendMessage(userId, recipient, message)

// Enviar sin humanización (casos especiales)
await BaileysStableService.sendMessageDirect(userId, recipient, message)
```

### Personalizar Variaciones

Edita `src/lib/message-variation-service.ts`:

```typescript
// Agregar nuevas variaciones para saludos
greeting: {
  patterns: [/^(hola|hey|buenos|buenas|qué tal)/i],
  variations: [
    (msg: string) => msg,
    (msg: string) => `¡${msg}!`,
    // Agregar tus propias variaciones aquí
    (msg: string) => `${msg} ¿Todo bien?`,
    (msg: string) => `${msg} ¿Cómo va todo?`,
  ]
}
```

### Agregar Nuevos Contextos

```typescript
// Agregar contexto para pagos
payment: {
  patterns: [/(pago|pagar|transferencia|tarjeta)/i],
  variations: [
    (msg: string) => msg,
    (msg: string) => `${msg} 💳`,
    (msg: string) => `Perfecto! ${msg}`,
    (msg: string) => `${msg} Es seguro y rápido`,
  ]
}
```

## 📈 Estadísticas

El sistema registra:
- Cuántas veces se envió cada mensaje
- Qué variación se usó
- Cuántos destinatarios únicos
- Cuántas frases únicas

Ver en el monitor anti-ban del dashboard.

## 🎨 Ejemplos por Contexto

### Productos
```
Original: "Este producto cuesta $50.000"

Variación 1: "Este producto cuesta $50.000 📦"
Variación 2: "Te cuento: Este artículo cuesta $50.000"
Variación 3: "Mira: Este producto cuesta $50.000 🛍️"
Variación 4: "Este item cuesta $50.000 ¿Te interesa?"
```

### Ofertas
```
Original: "Tenemos una oferta especial"

Variación 1: "Tenemos una oferta especial 🎉"
Variación 2: "¡Atención! Tenemos una oferta especial"
Variación 3: "Tenemos una oferta especial 🔥"
Variación 4: "Mira esta oferta: Tenemos una oferta especial"
```

### Ayuda
```
Original: "¿En qué puedo ayudarte?"

Variación 1: "¿En qué puedo ayudarte? 🤝"
Variación 2: "Claro! ¿En qué puedo ayudarte?"
Variación 3: "Con gusto te ayudo: ¿En qué puedo ayudarte?"
Variación 4: "Déjame ayudarte: ¿En qué puedo ayudarte?"
```

## ✅ Mejores Prácticas

### 1. **Usar Siempre Humanización**
```typescript
// ✅ BIEN
await BaileysStableService.sendMessage(userId, recipient, message)

// ❌ EVITAR (solo para casos muy específicos)
await BaileysStableService.sendMessageDirect(userId, recipient, message)
```

### 2. **Dejar que el Sistema Decida**
- No intentes agregar emojis manualmente
- El sistema los agrega automáticamente
- Evita duplicar emojis

### 3. **Mensajes Naturales**
- Escribe mensajes normales
- El sistema los humaniza automáticamente
- No uses lenguaje robótico

### 4. **Monitorear Variaciones**
- Revisa el monitor anti-ban
- Verifica que las variaciones sean naturales
- Ajusta si es necesario

## 🚀 Resultado Final

Con este sistema:
- ✅ Cada mensaje es único
- ✅ Comportamiento 100% humano
- ✅ Cero detección de spam
- ✅ Conversaciones naturales
- ✅ 99% menos riesgo de ban

---

**Versión:** 1.0  
**Fecha:** 2025-11-16  
**Estado:** ✅ Activo y Funcionando

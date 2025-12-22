# Pruebas Exhaustivas de Detección de Intenciones

**Fecha**: 21 de Noviembre de 2025  
**Sistema**: Intent Patterns v1.0

---

## 🎯 Objetivo

Probar que el bot detecta correctamente TODAS las intenciones posibles y NO se confunde enviando información irrelevante.

---

## ✅ Casos de Prueba por Intención

### 1. MÉTODOS DE PAGO (Prioridad Alta)

**Debe ir a**: `PaymentAgent`  
**NO debe**: Buscar productos con "método" o "pago"

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "el método de pago" | Mostrar métodos | PaymentAgent |
| "la forma de pago" | Mostrar métodos | PaymentAgent |
| "métodos de pago" | Mostrar métodos | PaymentAgent |
| "formas de pago" | Mostrar métodos | PaymentAgent |
| "cómo puedo pagar" | Mostrar métodos | PaymentAgent |
| "cómo se paga" | Mostrar métodos | PaymentAgent |
| "aceptan tarjeta" | Mostrar métodos | PaymentAgent |
| "puedo pagar con nequi" | Mostrar métodos | PaymentAgent |
| "qué métodos aceptan" | Mostrar métodos | PaymentAgent |
| "mercadopago" | Mostrar MercadoPago | PaymentAgent |
| "paypal" | Mostrar PayPal | PaymentAgent |

---

### 2. PAGO PENDIENTE

**Debe ir a**: `ClosingAgent`  
**NO debe**: Repetir información del producto

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "luego te envío el comprobante" | Confirmar espera | ClosingAgent |
| "después te mando el pago" | Confirmar espera | ClosingAgent |
| "más tarde te paso" | Confirmar espera | ClosingAgent |
| "ahorita te envío" | Confirmar espera | ClosingAgent |
| "voy a pagar" | Confirmar espera | ClosingAgent |
| "dame un momento" | Confirmar espera | ClosingAgent |
| "te aviso cuando pague" | Confirmar espera | ClosingAgent |

---

### 3. PRECIO

**Debe ir a**: `ProductAgent` (si hay producto) o `SearchAgent`  
**NO debe**: Buscar productos con "cuánto" o "precio"

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "cuánto cuesta" | Mostrar precio | ProductAgent |
| "cuál es el precio" | Mostrar precio | ProductAgent |
| "qué precio tiene" | Mostrar precio | ProductAgent |
| "a cómo está" | Mostrar precio | ProductAgent |
| "precio" | Mostrar precio | ProductAgent |
| "valor" | Mostrar precio | ProductAgent |
| "costo" | Mostrar precio | ProductAgent |

---

### 4. INFORMACIÓN DE PRODUCTO

**Debe ir a**: `ProductAgent`  
**NO debe**: Buscar nuevos productos

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "qué incluye" | Mostrar detalles | ProductAgent |
| "qué trae" | Mostrar detalles | ProductAgent |
| "características" | Mostrar detalles | ProductAgent |
| "especificaciones" | Mostrar detalles | ProductAgent |
| "más información" | Mostrar detalles | ProductAgent |
| "cuéntame más" | Mostrar detalles | ProductAgent |
| "tiene garantía" | Mostrar garantía | ProductAgent |
| "cómo me lo entregan" | Mostrar entrega | ProductAgent |
| "cuándo llega" | Mostrar entrega | ProductAgent |

---

### 5. PREGUNTAS GENERALES

**Debe ir a**: `GeneralQAAgent` (usa IA)  
**NO debe**: Buscar productos

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "¿dónde están ubicados?" | Info ubicación | GeneralQAAgent |
| "¿cuál es su dirección?" | Info ubicación | GeneralQAAgent |
| "¿cuál es su horario?" | Info horario | GeneralQAAgent |
| "¿cuándo abren?" | Info horario | GeneralQAAgent |
| "¿tienen tienda física?" | Info tienda | GeneralQAAgent |
| "¿cuál es su teléfono?" | Info contacto | GeneralQAAgent |
| "¿hacen reparación?" | Info servicios | GeneralQAAgent |
| "¿arreglan computadores?" | Info servicios | GeneralQAAgent |
| "¿quién eres?" | Info bot | GeneralQAAgent |
| "¿eres un bot?" | Info bot | GeneralQAAgent |
| "¿venden zapatos?" | No vendemos | GeneralQAAgent |
| "¿tienen comida?" | No vendemos | GeneralQAAgent |

---

### 6. BÚSQUEDA DE PRODUCTOS

**Debe ir a**: `SearchAgent`  
**Debe**: Buscar productos relevantes

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "busco laptop" | Buscar laptops | SearchAgent |
| "necesito una moto" | Buscar motos | SearchAgent |
| "quiero ver cursos" | Buscar cursos | SearchAgent |
| "tienen portátiles" | Buscar portátiles | SearchAgent |
| "hay motos" | Buscar motos | SearchAgent |
| "curso de piano" | Buscar curso piano | SearchAgent |
| "megapack de diseño" | Buscar megapack | SearchAgent |

---

### 7. DISPONIBILIDAD

**Debe ir a**: `SearchAgent`  
**Debe**: Verificar disponibilidad

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "está disponible" | Verificar stock | SearchAgent |
| "tienen disponible" | Verificar stock | SearchAgent |
| "hay en stock" | Verificar stock | SearchAgent |
| "lo tienen" | Verificar stock | SearchAgent |

---

### 8. SALUDOS Y DESPEDIDAS

**Debe ir a**: `GreetingAgent`

| Pregunta | Esperado | Agente |
|----------|----------|--------|
| "hola" | Saludo con marca | GreetingAgent |
| "buenos días" | Saludo con marca | GreetingAgent |
| "buenas tardes" | Saludo con marca | GreetingAgent |
| "hey" | Saludo con marca | GreetingAgent |
| "adiós" | Despedida | GreetingAgent |
| "gracias" | Despedida | GreetingAgent |
| "eso es todo" | Despedida | GreetingAgent |

---

## 🚫 Casos que NO Deben Pasar

### Errores Comunes a Evitar

| Pregunta | ❌ NO Debe Hacer | ✅ Debe Hacer |
|----------|------------------|---------------|
| "el método de pago" | Buscar productos | Mostrar métodos |
| "luego te envío" | Repetir info producto | Confirmar espera |
| "¿dónde están?" | Buscar productos | Responder ubicación |
| "cuánto cuesta" | Buscar productos | Mostrar precio |
| "qué incluye" | Buscar productos | Mostrar detalles |
| "¿venden zapatos?" | Buscar zapatos | Decir que no |

---

## 📊 Matriz de Prioridades

Cuando hay múltiples intenciones posibles, usar este orden:

1. **Saludo/Despedida** (Prioridad Máxima)
2. **Pago Pendiente** (Alta)
3. **Métodos de Pago** (Alta)
4. **Precio** (Media-Alta)
5. **Información de Producto** (Media)
6. **Disponibilidad** (Media)
7. **Preguntas Generales** (Media)
8. **Comparación** (Baja)
9. **Presupuesto** (Baja)
10. **Búsqueda de Productos** (Baja)

---

## 🧪 Cómo Probar

### Prueba Manual
```bash
# Conectar WhatsApp y enviar mensajes de prueba
npm run dev
```

### Prueba Automatizada
```bash
# Ejecutar script de pruebas
npx tsx scripts/test-preguntas-generales.ts
```

---

## ✅ Criterios de Éxito

Para cada pregunta, el bot debe:

1. ✅ Detectar la intención correcta
2. ✅ Dirigir al agente apropiado
3. ✅ NO buscar productos cuando no aplica
4. ✅ NO repetir información innecesaria
5. ✅ Mencionar "Tecnovariedades D&S" al menos una vez
6. ✅ Responder de forma natural y profesional

---

## 📝 Registro de Pruebas

### Formato de Registro

```
Fecha: [DD/MM/YYYY]
Pregunta: "[pregunta del cliente]"
Intención Detectada: [intención]
Agente Usado: [agente]
Respuesta: "[primeras 50 palabras]"
✅/❌ Correcto: [Sí/No]
Notas: [observaciones]
```

### Ejemplo

```
Fecha: 21/11/2025
Pregunta: "el método de pago"
Intención Detectada: payment_inquiry
Agente Usado: PaymentAgent
Respuesta: "💳 Métodos de Pago Disponibles: 1️⃣ MercadoPago..."
✅ Correcto: Sí
Notas: Funcionó perfectamente, no buscó productos
```

---

## 🔧 Mantenimiento

### Agregar Nuevos Patrones

1. Editar `src/lib/intent-patterns.ts`
2. Agregar patrón a la intención correspondiente
3. Probar con casos reales
4. Documentar en este archivo

### Ejemplo

```typescript
// En intent-patterns.ts
payment_inquiry: [
  // ... patrones existentes
  /nuevo\s+patron/i,  // Agregar aquí
],
```

---

## 📈 Métricas

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Detección correcta | >95% | - |
| Sin búsquedas erróneas | 100% | - |
| Respuestas relevantes | >90% | - |
| Menciona marca | 100% | - |

---

**Última Actualización**: 21 de Noviembre de 2025  
**Versión**: 1.0  
**Mantenedor**: Sistema de IA

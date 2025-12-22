# ✅ Sistema de FAQ de Productos Implementado

## 🎯 Objetivo

Crear una base de conocimiento para productos digitales que permita al bot responder preguntas frecuentes **sin usar IA**, ahorrando tokens y mejorando la velocidad de respuesta.

## 📚 Base de Conocimiento Creada

### Archivo: `knowledge-base/curso-piano-faq.json`

**Contiene:**
- ✅ 20 preguntas y respuestas frecuentes
- ✅ Keywords para detección automática
- ✅ Información adicional del producto
- ✅ Link de pago de Hotmart
- ✅ Detalles técnicos (lecciones, duración, etc.)

### Preguntas Cubiertas:

1. ¿De qué trata el curso?
2. ¿Necesito tener piano o teclado?
3. ¿Puedo aprender desde cero?
4. ¿Sirve para nivel intermedio/avanzado?
5. ¿Cuánto dura el curso?
6. ¿Cuánto tiempo tengo acceso?
7. ¿Puedo verlo en celular/tablet?
8. ¿Qué aprenderé exactamente?
9. ¿Las clases son en vivo o grabadas?
10. ¿Recibiré certificado?
11. ¿Quién enseña el curso?
12. ¿Tiene garantía o devolución?
13. ¿Qué pasa si no tengo tiempo?
14. ¿Cómo se realiza el pago?
15. ¿Cuál es el precio?
16. ¿Puedo pagar en mi moneda?
17. ¿Qué pasa después de pagar?
18. ¿Ofrecen soporte?
19. ¿Puedo regalarlo?
20. ¿Por qué elegir este curso?

## 🔧 Servicio Implementado

### Archivo: `src/lib/product-faq-service.ts`

**Funcionalidades:**

1. **`initialize()`** - Carga automática de archivos JSON
2. **`findAnswer()`** - Busca respuesta por keywords y similitud
3. **`getProductInfo()`** - Obtiene información completa del producto
4. **`getAllFAQs()`** - Lista todas las FAQs
5. **`findProductByName()`** - Busca producto por nombre
6. **`isFAQQuestion()`** - Detecta si es pregunta FAQ
7. **`enrichAnswer()`** - Enriquece respuesta con links

## 🎯 Integración en Flujo Digital

### Archivo: `src/conversational-module/flows/flujoDigital.ts`

**Flujo:**

```
1. Usuario hace pregunta sobre producto digital
   ↓
2. Sistema detecta si es pregunta FAQ
   ↓
3. Busca respuesta en base de conocimiento
   ↓
4. Si encuentra (confianza >= 60%):
   ✅ Responde inmediatamente SIN usar IA
   ↓
5. Si NO encuentra:
   🤖 Usa IA como antes
```

## 💡 Ventajas

### 1. **Ahorro de Tokens**
- ❌ Antes: Cada pregunta usaba ~500 tokens de IA
- ✅ Ahora: Preguntas FAQ = 0 tokens de IA

### 2. **Velocidad**
- ❌ Antes: 2-3 segundos (llamada a IA)
- ✅ Ahora: <100ms (búsqueda local)

### 3. **Consistencia**
- ✅ Respuestas siempre iguales y precisas
- ✅ No hay variación en la información
- ✅ Links de pago siempre correctos

### 4. **Escalabilidad**
- ✅ Fácil agregar más productos
- ✅ Fácil actualizar información
- ✅ No requiere reentrenar IA

## 🧪 Cómo Probar

### 1. Ejecutar Test de FAQ

```bash
npx tsx scripts/test-faq-sistema.ts
```

Este script probará:
- ✅ Carga de base de conocimiento
- ✅ Detección de respuestas
- ✅ Nivel de confianza
- ✅ Información del producto

### 2. Probar en WhatsApp

```
Tú: "Curso de piano"
Bot: [Envía información del producto]

Tú: "¿Cuánto cuesta?"
Bot: [Respuesta instantánea desde FAQ] ⚡

Tú: "¿Necesito tener piano?"
Bot: [Respuesta instantánea desde FAQ] ⚡

Tú: "¿Tiene certificado?"
Bot: [Respuesta instantánea desde FAQ] ⚡
```

## 📊 Ejemplo de Respuestas

### Pregunta: "¿Cuánto cuesta el curso?"

**Respuesta automática:**
```
El curso tiene un precio promocional de 60.000 COP con acceso 
de por vida y todas las actualizaciones gratis 🎁

👉 Compra aquí: https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205
```

### Pregunta: "¿Necesito tener piano?"

**Respuesta automática:**
```
No necesariamente 😊 Puedes comenzar aprendiendo teoría, 
digitación y lectura con un piano virtual o con un teclado 
básico (de 61 teclas o más). Luego, cuando avances, podrás 
aplicar todo en cualquier instrumento real 🎶
```

## 🔄 Cómo Agregar Más Productos

### 1. Crear archivo JSON

Crea `knowledge-base/[nombre-producto]-faq.json`:

```json
{
  "producto": "Nombre del Producto",
  "productId": "id-del-producto-en-bd",
  "categoria": "DIGITAL",
  "precio": 50000,
  "linkPago": "https://...",
  "faqs": [
    {
      "id": 1,
      "pregunta": "¿Pregunta?",
      "keywords": ["palabra1", "palabra2"],
      "respuesta": "Respuesta completa"
    }
  ],
  "informacionAdicional": {
    "duracion": "10 horas",
    "acceso": "De por vida"
  }
}
```

### 2. Reiniciar el servidor

```bash
npm run dev
```

El sistema cargará automáticamente el nuevo producto.

## 📝 Keywords Importantes

El sistema detecta preguntas usando keywords:

- **Precio**: "precio", "costo", "valor", "cuánto cuesta"
- **Duración**: "duración", "cuánto dura", "tiempo"
- **Acceso**: "acceso", "cuánto tiempo", "vencimiento"
- **Certificado**: "certificado", "diploma", "título"
- **Garantía**: "garantía", "devolución", "reembolso"
- **Pago**: "pago", "pagar", "cómo comprar"
- **Dispositivos**: "celular", "móvil", "tablet"
- **Nivel**: "principiante", "intermedio", "avanzado"

## 🎯 Detección Inteligente

El sistema usa dos métodos:

1. **Keywords**: Busca palabras clave en la pregunta
2. **Similitud**: Compara con preguntas en la base

**Confianza mínima:** 60% para responder automáticamente

## ✅ Estado Actual

- [x] Base de conocimiento del Curso de Piano creada
- [x] Servicio de FAQ implementado
- [x] Integración en flujo digital
- [x] Sistema de detección de preguntas
- [x] Búsqueda por keywords y similitud
- [x] Script de prueba creado
- [x] Documentación completa

## 🚀 Próximos Pasos

### Para Otros Productos Digitales:

1. **Megapacks**: Crear `knowledge-base/megapack-faq.json`
2. **Cursos**: Crear archivos para cada curso
3. **Software**: Agregar FAQs de productos de software

### Ejemplo para Megapack:

```json
{
  "producto": "Megapack 20.000 Cursos",
  "productId": "id-megapack",
  "precio": 20000,
  "faqs": [
    {
      "pregunta": "¿Cuántos cursos incluye?",
      "keywords": ["cuántos", "cantidad", "incluye"],
      "respuesta": "Incluye más de 20.000 cursos en diversas categorías..."
    }
  ]
}
```

## 📊 Métricas Esperadas

**Antes (solo IA):**
- 100% de preguntas usan IA
- ~500 tokens por pregunta
- 2-3 segundos de respuesta

**Después (con FAQ):**
- ~70% de preguntas usan FAQ
- 0 tokens para FAQ
- <100ms de respuesta para FAQ
- 30% de preguntas complejas usan IA

**Ahorro estimado:** 70% de tokens en productos digitales

## 🎉 Beneficios Finales

1. ✅ **Respuestas instantáneas** para preguntas comunes
2. ✅ **Ahorro masivo de tokens** de IA
3. ✅ **Información siempre actualizada** y consistente
4. ✅ **Fácil de mantener** (solo editar JSON)
5. ✅ **Escalable** a todos los productos
6. ✅ **Links de pago correctos** siempre

---

**Fecha:** 2024-11-10
**Estado:** ✅ IMPLEMENTADO Y LISTO
**Sistema:** Base de conocimiento de productos con FAQ

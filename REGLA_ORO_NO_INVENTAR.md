# 🚫 REGLA DE ORO: NUNCA INVENTAR INFORMACIÓN

## Principio Fundamental

**El bot NUNCA debe inventar información que no tiene.**

Si no tiene un dato real, debe:
1. ✅ Responder con lo que SÍ sabe
2. ✅ Ofrecer alternativas
3. ❌ NUNCA inventar números, precios, o información falsa

## 📋 Información que SIEMPRE debe ser REAL

### 1. Métodos de Pago (LOCAL - 0 tokens)

**Número correcto:** `3136174267`

```
Cliente: "Cómo puedo pagar?"
Bot: 💳 Métodos de Pago Disponibles:

✅ Nequi: 3136174267
✅ Daviplata: 3136174267
✅ Transferencia bancaria
✅ Efectivo (contraentrega)

¿Con cuál método te gustaría pagar? 😊
```

**Respuesta LOCAL (0 tokens)** - No usa IA

### 2. Precios de Productos (LOCAL - 0 tokens)

```
Cliente: "Cuánto cuesta?"
Bot: 💰 Curso Completo de Piano Online

Precio: $60.000 COP

¿Te gustaría más información? 📸
```

**Respuesta LOCAL (0 tokens)** - Precio de la BD

### 3. Información del Negocio (LOCAL - 0 tokens)

```
Cliente: "Dónde están ubicados?"
Bot: 📍 Tecnovariedades D&S

Ubicación: Centro Comercial El Diamante 2
Ciudad: Cali, Colombia
Teléfono: +57 304 274 8687

¿En qué más puedo ayudarte? 😊
```

**Respuesta LOCAL (0 tokens)** - Info de la BD

## 🧠 Cuándo SÍ usar IA (Groq)

### Solo para razonamiento complejo:

1. **Comparaciones**
   - "Cuál es mejor, laptop o desktop?"
   - "Qué diferencia hay entre estos productos?"

2. **Recomendaciones**
   - "Qué me recomiendas para diseño gráfico?"
   - "Necesito algo económico para estudiar"

3. **Búsquedas complejas**
   - "Busco algo para editar videos profesionalmente"
   - "Necesito un curso de piano para principiantes"

## ❌ Ejemplos de lo que NUNCA debe hacer

### ❌ INCORRECTO (Inventar números):
```
Cliente: "Cómo puedo pagar?"
Bot: "Puedes pagar por Nequi al 300-555-0186" ❌ INVENTADO
```

### ✅ CORRECTO (Datos reales):
```
Cliente: "Cómo puedo pagar?"
Bot: "Puedes pagar por Nequi al 3136174267" ✅ REAL
```

### ❌ INCORRECTO (Inventar características):
```
Cliente: "Qué incluye el curso?"
Bot: "Incluye certificado y 50 horas de video" ❌ INVENTADO
```

### ✅ CORRECTO (Solo lo que está en BD):
```
Cliente: "Qué incluye el curso?"
Bot: "🎵 Curso Completo de Piano Online

✅ Aprende piano desde cero hasta nivel avanzado
✅ Lecciones en video de alta calidad
✅ Método progresivo y fácil de seguir

[Solo lo que está en la descripción del producto]
```

## 🔒 Sistema de Protección

### 1. Respuestas Locales (0 tokens)
- Saludos
- Precios
- Métodos de pago
- Información del negocio
- Fotos

**Ventaja:** Siempre son correctas porque vienen de la BD

### 2. Respuestas con IA (tokens)
- Solo para razonamiento
- Nunca para datos específicos
- Siempre basadas en contexto real

**Protección:** La IA recibe solo datos reales de la BD

## 📊 Flujo de Decisión

```
Cliente pregunta
        ↓
¿Es dato específico? (precio, pago, info)
        ↓
    SÍ → Respuesta LOCAL (BD) ✅
        ↓
    NO → ¿Requiere razonamiento?
        ↓
    SÍ → Groq API con contexto real ✅
        ↓
    NO → Respuesta LOCAL ✅
```

## ✅ Configuración Aplicada

### Variables de Entorno:
```env
# Números REALES
NEQUI_NUMBER=3136174267
DAVIPLATA_NUMBER=3136174267

# Sistema híbrido (70% local)
ENABLE_HYBRID_SYSTEM=true
LOCAL_RESPONSE_PRIORITY=true
```

### LocalResponseHandler:
- ✅ Usa números reales del .env
- ✅ Nunca inventa información
- ✅ Responde solo con datos verificados

### Groq API:
- ✅ Solo se usa para razonamiento
- ✅ Recibe contexto real de la BD
- ✅ No inventa datos específicos

## 💡 Mejores Prácticas

### 1. Siempre verificar datos
- Precios → De la BD
- Métodos de pago → Del .env
- Info del negocio → De la BD

### 2. Nunca asumir
- Si no está en la BD, no existe
- Si no está en el .env, no lo digas
- Si no lo sabes, ofrece alternativas

### 3. Ser honesto
```
Cliente: "Tienen garantía?"
Bot: "Déjame verificar esa información con el equipo.
      ¿Te interesa algún producto en particular?"
```

Mejor que inventar: "Sí, 2 años de garantía" ❌

## 🎯 Resultado

Con este sistema:
- ✅ 70% respuestas locales (siempre correctas)
- ✅ 30% respuestas con IA (basadas en datos reales)
- ✅ 0% información inventada
- ✅ 100% confiabilidad

---

**Fecha:** 22 de noviembre de 2025
**Regla:** NUNCA INVENTAR INFORMACIÓN
**Número correcto:** 3136174267
**Sistema:** Híbrido con datos reales

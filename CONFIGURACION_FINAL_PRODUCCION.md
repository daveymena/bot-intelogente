# ✅ CONFIGURACIÓN FINAL PARA PRODUCCIÓN

**Fecha:** 28 Noviembre 2025  
**Modelo:** gemma2:2b (ligero y rápido)  
**Estado:** 🟢 LISTO PARA PROBAR EN REAL

---

## ⚡ Configuración Optimizada

### Modelo Seleccionado: gemma2:2b
**Razones:**
- ✅ Rápido: 3-8 segundos (vs 15-20s de llama3.1:8b)
- ✅ Ligero: 2GB RAM (vs 5GB)
- ✅ Suficiente para conversaciones
- ✅ Usa agentes del sistema para tareas complejas

### .env Configurado:
```env
# Modelo ligero y rápido
OLLAMA_MODEL=gemma2:2b
OLLAMA_TIMEOUT=30000  # 30 segundos
OLLAMA_MAX_TOKENS=150  # Respuestas cortas

# Groq desactivado (ahorro)
DISABLE_GROQ=true
```

---

## 🤖 Cómo Funciona

### IA (gemma2:2b) - Coordinador
```
Cliente: "Busco laptop para diseño"

IA piensa:
1. Cliente busca laptop
2. Llamar AGENTE DE BÚSQUEDA
3. Mostrar resultados al cliente

IA responde: "¡Perfecto! 😊 Tengo:
1. Laptop Asus - $1.329.900
2. Laptop HP - $1.749.900
¿Cuál te interesa?"
```

### Agentes del Sistema - Ejecutores
```
AGENTE DE BÚSQUEDA:
- Busca en PostgreSQL
- Filtra por keywords
- Devuelve productos reales

AGENTE DE PAGOS:
- Genera links con MercadoPago API
- Genera links con PayPal API
- Devuelve URL real

AGENTE DE FOTOS:
- Envía imágenes de productos
- Automático después de mostrar productos
```

---

## 📊 Velocidades Esperadas

| Tipo de Mensaje | Tiempo | Quién Responde |
|-----------------|--------|----------------|
| "Hola" | 0.001s | Caché ⚡ |
| "Gracias" | 0.001s | Caché ⚡ |
| "Busco laptop" | 3-8s | IA + Agente BD |
| "Opción 2" | 3-8s | IA (contexto) |
| "Generar link" | 3-8s | IA + Agente Pagos |

**Promedio: 2-5 segundos** ⚡

---

## 🎯 Prompt Optimizado

```typescript
Eres Laura, vendedora de Tecnovariedades D&S por WhatsApp.

SISTEMA Y AGENTES:
- El sistema tiene AGENTES que hacen el trabajo pesado
- Agente de búsqueda: Busca productos en BD
- Agente de pagos: Genera links con MercadoPago/PayPal API
- Agente de fotos: Envía imágenes automáticamente
- TÚ solo coordinas y confirmas al cliente

REGLAS:
- Lee TODO el historial antes de responder
- Si dice "opción 2" → Busca qué productos YA mostraste
- NO repitas el saludo si ya saludaste
- Responde SOLO lo que preguntó (máximo 4 líneas)
- Usa emojis sutiles 😊

PRODUCTOS:
- Si hay productos abajo, USA SOLO ESOS
- NO inventes productos ni precios
- Las fotos las envía el AGENTE DE FOTOS

PAGOS:
- Métodos: MercadoPago, PayPal, Nequi, Daviplata
- Si dice "generar link": "Perfecto 🙌 Enseguida genero tu enlace..."
- El AGENTE DE PAGOS genera el link real
- NO inventes links
```

---

## 🚀 Iniciar Sistema

```bash
# Opción 1: Script
INICIAR_CON_OLLAMA_LLAMA31.bat

# Opción 2: Manual
npm run dev
```

Luego:
1. Abre http://localhost:3000
2. Conecta WhatsApp
3. Prueba con tu número real

---

## 🧪 Pruebas Recomendadas

### Test 1: Saludo
```
Tú: "Hola"
Bot: "¡Hola! 😊 Bienvenido..." (0.001s)
```

### Test 2: Búsqueda
```
Tú: "Busco una laptop"
Bot: "¡Perfecto! 😊 Tengo:
1. Laptop Asus - $1.329.900
2. Laptop HP - $1.749.900
¿Cuál te interesa?" (3-8s)
```

### Test 3: Contexto
```
Tú: "Cuéntame de la 1"
Bot: "La Laptop Asus tiene..." (3-8s)
```

### Test 4: Pago
```
Tú: "Genérame el link"
Bot: "Perfecto 🙌 Enseguida genero tu enlace..." (3-8s)
[Sistema genera link real con API]
```

---

## ⚠️ Qué Esperar

### ✅ Funcionará Bien:
- Saludos y despedidas (instantáneo)
- Búsqueda de productos (3-8s)
- Mantener contexto básico
- Confirmar acciones

### ⚠️ Puede Necesitar Ajustes:
- Contexto muy largo (>10 mensajes)
- Preguntas muy complejas
- Comparaciones detalladas

### 🔧 Si Necesita Mejorar:
1. Cambiar a llama3.1:8b (más lento pero mejor memoria)
2. Activar Groq para casos complejos
3. Ajustar prompt según feedback

---

## 💰 Costos

| Configuración | Velocidad | Costo/mes |
|---------------|-----------|-----------|
| **gemma2:2b (actual)** | 3-8s | $0 |
| llama3.1:8b | 15-20s | $0 |
| + Groq urgente | 2-3s | $150 |
| Solo Groq | 2-3s | $750 |

**Ahorro actual: $9,000/año** 🎉

---

## 📝 Checklist Pre-Producción

- [x] Modelo gemma2:2b configurado
- [x] Prompt optimizado con agentes
- [x] Caché de respuestas implementado
- [x] Tokens reducidos (150)
- [x] Timeout ajustado (30s)
- [x] Tests pasando
- [ ] Probado en WhatsApp real
- [ ] Feedback de usuario real
- [ ] Ajustes según necesidad

---

## 🎯 Plan de Prueba

### Día 1 (Hoy):
1. Iniciar sistema
2. Conectar WhatsApp
3. Probar con 5-10 conversaciones reales
4. Anotar problemas

### Día 2-7:
1. Monitorear velocidad
2. Recopilar feedback
3. Ajustar prompt si es necesario
4. Documentar casos edge

### Después de 1 Semana:
1. Evaluar si gemma2:2b es suficiente
2. Considerar llama3.1:8b si necesita mejor memoria
3. Considerar Groq si necesita más velocidad

---

## 🔄 Cambios Rápidos

### Si es muy lento:
```env
# Reducir más los tokens
OLLAMA_MAX_TOKENS=100
```

### Si pierde contexto:
```env
# Cambiar a modelo más grande
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT=60000
```

### Si necesita velocidad extrema:
```env
# Activar Groq
DISABLE_GROQ=false
```

---

## ✅ Resumen

**Configuración actual:**
- Modelo: gemma2:2b (ligero y rápido)
- Velocidad: 2-5s promedio
- Costo: $0/mes
- Usa agentes del sistema para tareas complejas

**Estado:** 🟢 LISTO PARA PROBAR EN REAL

**Próximo paso:** Iniciar y probar con clientes reales

---

## 🚀 Comando para Iniciar

```bash
npm run dev
```

**¡A probar en real! 🎉**

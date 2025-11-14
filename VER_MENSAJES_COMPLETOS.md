# 👀 Ver Mensajes Completos del Bot

## 🎯 Objetivo

Ver el contenido REAL de los mensajes (lo que escribes y lo que el bot responde) para identificar errores.

## ✅ Cambios Aplicados

### 1. Logs Mejorados en Message Handler

**Archivo**: `src/clean-bot/controllers/message-handler.ts`

Ahora muestra:

```
================================================================================
📥 MENSAJE RECIBIDO
================================================================================
👤 Usuario: 573001234567@s.whatsapp.net
💬 Mensaje: Necesito más información del curso de piano
================================================================================

[CleanBot] 📋 Contexto: {...}
[CleanBot] 🎯 Intención: producto
[Products] 🔍 Buscando: Necesito más información del curso de piano
[Products] ✅ Encontrado: Curso Completo de Piano Online

================================================================================
📤 RESPUESTA DEL BOT
================================================================================
✅ *Curso Completo de Piano Online*

📋 Aprende piano desde cero con este curso completo...

💰 *Precio:* 50,000 COP
📲 *Entrega:* Digital inmediata

¿Quieres comprarlo? 🔗
================================================================================
```

## 🧪 Cómo Probar

### Opción 1: Usar WhatsApp Real

```bash
# 1. Iniciar servidor
npm run dev

# 2. Conectar WhatsApp (escanear QR)

# 3. Enviar mensajes desde tu teléfono

# 4. Ver logs en consola con formato mejorado
```

### Opción 2: Script de Prueba

```bash
# Ejecutar conversación simulada
npx tsx scripts/test-conversacion-completa.ts
```

Este script simula una conversación completa:
1. "Hola"
2. "Estoy interesado en el curso de piano"
3. "Necesito más información del curso de piano"
4. "Cuánto cuesta?"
5. "Quiero pagar"

Y muestra TODOS los mensajes con formato claro.

## 📊 Formato de Logs

### Mensaje Recibido

```
================================================================================
📥 MENSAJE RECIBIDO
================================================================================
👤 Usuario: [número de WhatsApp]
💬 Mensaje: [texto exacto que escribiste]
================================================================================
```

### Respuesta del Bot

```
================================================================================
📤 RESPUESTA DEL BOT
================================================================================
[texto exacto que el bot responde]
================================================================================
```

### Respuesta de Pago

```
================================================================================
📤 RESPUESTA DEL BOT (PAGO)
================================================================================
💳 *Métodos de Pago para Curso de Piano*

🔗 *MercadoPago*
https://mpago.la/...

💰 *Precio:* 50,000 COP
================================================================================
```

## 🔍 Qué Buscar

### ✅ Respuestas Correctas

- Información viene de la base de datos
- Precios correctos
- Nombres de productos correctos
- Links de pago reales (no inventados)

### ❌ Errores a Identificar

- **Información inventada**: Datos que no están en BD
- **Precios incorrectos**: No coinciden con BD
- **Productos equivocados**: Responde sobre otro producto
- **Links falsos**: URLs que no existen
- **Contexto perdido**: No recuerda el producto anterior

## 📝 Ejemplo de Conversación Real

```
================================================================================
📥 MENSAJE RECIBIDO
================================================================================
👤 Usuario: 573001234567@s.whatsapp.net
💬 Mensaje: Hola
================================================================================

[CleanBot] 🎯 Intención: saludo

================================================================================
📤 RESPUESTA DEL BOT
================================================================================
👋 ¡Hola! Bienvenido a Tecnovariedades D&S

¿En qué puedo ayudarte? 😊
================================================================================

================================================================================
📥 MENSAJE RECIBIDO
================================================================================
👤 Usuario: 573001234567@s.whatsapp.net
💬 Mensaje: Estoy interesado en el curso de piano
================================================================================

[CleanBot] 🎯 Intención: producto
[Products] 🔍 Buscando: curso piano
[Products] ✅ Encontrado: Curso Completo de Piano Online

================================================================================
📤 RESPUESTA DEL BOT
================================================================================
✅ *Curso Completo de Piano Online*

📋 Aprende piano desde cero con este curso completo...

💰 *Precio:* 50,000 COP
📲 *Entrega:* Digital inmediata

¿Quieres comprarlo? 🔗
================================================================================

================================================================================
📥 MENSAJE RECIBIDO
================================================================================
👤 Usuario: 573001234567@s.whatsapp.net
💬 Mensaje: Quiero pagar
================================================================================

[CleanBot] 🎯 Intención: pago
[CleanBot] 💳 Generando links de pago...

================================================================================
📤 RESPUESTA DEL BOT (PAGO)
================================================================================
💳 *Métodos de Pago para Curso Completo de Piano Online*

🔗 *MercadoPago*
https://mpago.la/2Xj8K9L

💰 *Precio:* 50,000 COP

¿Listo para pagar? 😊
================================================================================
```

## 🎯 Cómo Reportar Errores

Cuando encuentres un error, copia:

1. **Mensaje que enviaste** (de la sección 📥)
2. **Respuesta del bot** (de la sección 📤)
3. **Qué esperabas** vs **Qué recibiste**

Ejemplo:

```
❌ ERROR ENCONTRADO

📥 Envié: "Cuánto cuesta el curso de piano?"

📤 Bot respondió: "El curso cuesta 100,000 COP"

❌ Problema: El precio correcto es 50,000 COP (verificado en BD)
```

## 🚀 Próximos Pasos

1. Ejecutar `npm run dev`
2. Probar conversaciones reales
3. Copiar los logs con formato
4. Identificar errores específicos
5. Reportar con ejemplos concretos

Los logs ahora son **100% claros** y muestran exactamente qué está pasando 🎯

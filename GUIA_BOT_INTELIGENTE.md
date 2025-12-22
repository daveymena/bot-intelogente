# 🤖 Guía Completa - Bot Inteligente de WhatsApp

## 🎯 ¿Cómo Funciona?

Tu bot ahora responde automáticamente a los mensajes de WhatsApp usando **Inteligencia Artificial (Groq + Llama 3.1)**.

### Flujo Automático

```
Cliente envía mensaje
       ↓
Baileys recibe el mensaje
       ↓
Se guarda en la base de datos
       ↓
IA analiza el mensaje + historial + productos
       ↓
IA genera respuesta personalizada
       ↓
Bot envía respuesta automáticamente
       ↓
Se guarda la respuesta en DB
```

---

## ✅ Características del Bot

### 1. Respuestas Inteligentes

El bot usa IA para:
- ✅ Entender la intención del cliente
- ✅ Responder de forma natural y conversacional
- ✅ Recomendar productos relevantes
- ✅ Proporcionar información de precios
- ✅ Cerrar ventas de forma sutil

### 2. Contexto del Negocio

El bot conoce:
- ✅ Tus productos (nombre, precio, descripción)
- ✅ Tu información de negocio
- ✅ Prompts personalizados que configures
- ✅ Historial de conversación con cada cliente

### 3. Detección de Intenciones

El bot detecta automáticamente:
- 🙋 **Saludos** - "Hola", "Buenos días"
- 💰 **Consultas de precio** - "Cuánto cuesta", "Precio"
- 📦 **Consultas de producto** - "Tienes", "Disponible"
- 🛒 **Intención de compra** - "Quiero comprar", "Pedir"
- ℹ️ **Solicitud de información** - "Información", "Detalles"
- 👋 **Despedidas** - "Gracias", "Adiós"

---

## 🎨 Personalización del Bot

### Opción 1: Configurar Información del Negocio

1. Ve al dashboard
2. Sección "Configuración"
3. Completa:
   - Nombre del negocio
   - Descripción
   - Dirección
   - Teléfono

### Opción 2: Agregar Productos

1. Ve a "Productos"
2. Haz clic en "Agregar Producto"
3. Completa:
   - Nombre del producto
   - Precio
   - Descripción detallada
   - Categoría
   - Stock

**El bot usará esta información para recomendar productos.**

### Opción 3: Crear Prompts Personalizados

1. Ve a "IA & Prompts"
2. Haz clic en "Crear Prompt"
3. Ejemplos:

**Prompt de Bienvenida:**
```
Nombre: Saludo Inicial
Contenido: Siempre saluda mencionando que somos una tienda de tecnología 
con 10 años de experiencia. Ofrece ayuda inmediata.
```

**Prompt de Política de Envíos:**
```
Nombre: Envíos
Contenido: Hacemos envíos gratis en compras mayores a $50. 
Envíos nacionales en 2-3 días hábiles.
```

**Prompt de Horarios:**
```
Nombre: Horario de Atención
Contenido: Nuestro horario es de lunes a viernes 9am-6pm, 
sábados 10am-2pm. Fuera de horario, responderemos al siguiente día hábil.
```

---

## 📊 Ejemplos de Conversaciones

### Ejemplo 1: Consulta de Producto

**Cliente:** "Hola, tienes laptops?"

**Bot:** "¡Hola! 👋 Sí, tenemos laptops disponibles. Te muestro algunas opciones:

- Laptop HP 15.6" - $599 - Intel i5, 8GB RAM, 256GB SSD
- Laptop Dell Inspiron - $749 - Intel i7, 16GB RAM, 512GB SSD
- Laptop Lenovo ThinkPad - $899 - Intel i7, 16GB RAM, 1TB SSD

¿Cuál te interesa más? 😊"

### Ejemplo 2: Consulta de Precio

**Cliente:** "Cuánto cuesta la laptop HP?"

**Bot:** "La Laptop HP 15.6" tiene un precio de $599. Es una excelente opción con Intel i5, 8GB RAM y 256GB SSD. Perfecta para trabajo y estudio. ¿Te gustaría hacer el pedido? 🛒"

### Ejemplo 3: Intención de Compra

**Cliente:** "Quiero comprar la Dell"

**Bot:** "¡Perfecto! 🎉 La Laptop Dell Inspiron a $749 es una excelente elección. 

Para procesar tu pedido necesito:
1. Nombre completo
2. Dirección de envío
3. Método de pago preferido

¿Me confirmas estos datos? 📝"

### Ejemplo 4: Información General

**Cliente:** "Hacen envíos?"

**Bot:** "¡Sí! Hacemos envíos a todo el país. 📦

- Envíos GRATIS en compras mayores a $50
- Envíos nacionales en 2-3 días hábiles
- Envíos express disponibles (24-48 horas)

¿A qué ciudad necesitas el envío? 🚚"

---

## ⚙️ Configuración Avanzada

### Ajustar el Comportamiento del Bot

Edita el archivo `.env`:

```env
# Modelo de IA (más rápido o más inteligente)
GROQ_MODEL=llama-3.1-8b-instant  # Rápido
# GROQ_MODEL=llama-3.3-70b-versatile  # Más inteligente

# Longitud de respuestas
GROQ_MAX_TOKENS=400  # Respuestas cortas
# GROQ_MAX_TOKENS=800  # Respuestas más largas

# Creatividad (0.0 - 2.0)
# 0.7 = Balanceado (recomendado)
# 0.3 = Más conservador
# 1.0 = Más creativo
```

### Desactivar Respuestas Automáticas

Si quieres responder manualmente:

1. Edita `src/lib/baileys-service.ts`
2. Comenta la línea:
```typescript
// await this.handleAutoResponse(socket, userId, from, messageText, conversation.id)
```

---

## 📱 Probar el Bot

### Prueba 1: Saludo Básico

1. Desde otro teléfono, envía: **"Hola"**
2. El bot debe responder con un saludo personalizado
3. Verifica en el dashboard que aparezca la conversación

### Prueba 2: Consulta de Productos

1. Envía: **"Qué productos tienes?"**
2. El bot debe listar tus productos
3. Verifica que los precios sean correctos

### Prueba 3: Consulta de Precio

1. Envía: **"Cuánto cuesta [nombre de producto]?"**
2. El bot debe responder con el precio exacto
3. Debe ofrecer más información

### Prueba 4: Intención de Compra

1. Envía: **"Quiero comprar [producto]"**
2. El bot debe iniciar el proceso de pedido
3. Debe pedir información necesaria

---

## 🔍 Monitoreo y Logs

### Ver Logs en Tiempo Real

En la terminal del servidor verás:

```
[Baileys] 📨 Mensaje recibido de 573001234567@s.whatsapp.net: Hola
[Baileys] 🤖 Generando respuesta automática con IA...
[AI] Generando respuesta para: "Hola"
[AI] Respuesta generada: "¡Hola! 👋 Bienvenido a..."
[Baileys] ✅ Respuesta generada: "¡Hola! 👋 Bienvenido a..."
[Baileys] 📤 Respuesta enviada a 573001234567@s.whatsapp.net
```

### Ver Conversaciones en el Dashboard

1. Ve a "Conversaciones"
2. Verás todas las conversaciones activas
3. Haz clic en una para ver el historial completo
4. Puedes responder manualmente si lo deseas

---

## 🎯 Mejores Prácticas

### 1. Mantén los Productos Actualizados

- Agrega descripciones detalladas
- Actualiza precios regularmente
- Marca productos sin stock como inactivos

### 2. Crea Prompts Específicos

- Políticas de devolución
- Métodos de pago aceptados
- Horarios de atención
- Promociones actuales

### 3. Revisa las Conversaciones

- Verifica que el bot responda correctamente
- Ajusta prompts si es necesario
- Interviene manualmente cuando sea importante

### 4. Prueba Regularmente

- Envía mensajes de prueba
- Verifica diferentes escenarios
- Ajusta según los resultados

---

## 🚀 Funcionalidades Avanzadas (Próximamente)

### En Desarrollo:

- [ ] Envío de imágenes de productos
- [ ] Catálogo interactivo
- [ ] Procesamiento de pedidos completo
- [ ] Integración con pagos
- [ ] Notificaciones de seguimiento
- [ ] Respuestas con botones interactivos
- [ ] Análisis de sentimiento
- [ ] Reportes de ventas por IA

---

## 🐛 Solución de Problemas

### El bot no responde

**Verificar:**
1. ¿WhatsApp está conectado? (Estado = CONNECTED)
2. ¿Hay errores en la terminal?
3. ¿La API key de Groq es válida?

**Solución:**
```bash
# Verificar conexión
http://localhost:3000/api/whatsapp/status

# Ver logs
# Revisa la terminal del servidor
```

### Las respuestas no son relevantes

**Verificar:**
1. ¿Los productos tienen descripciones?
2. ¿Los prompts están configurados?
3. ¿El modelo de IA es el correcto?

**Solución:**
- Agrega más información a los productos
- Crea prompts más específicos
- Prueba con `llama-3.3-70b-versatile` (más inteligente)

### El bot responde muy lento

**Verificar:**
1. ¿Cuántos productos tienes?
2. ¿Qué modelo estás usando?

**Solución:**
- Usa `llama-3.1-8b-instant` (más rápido)
- Reduce `GROQ_MAX_TOKENS` a 300
- Limita productos activos a los más importantes

---

## 📚 Recursos

### Documentación
- `ESTADO_REAL_DEL_PROYECTO.md` - Estado del proyecto
- `WHATSAPP_REAL_BAILEYS.md` - Documentación de Baileys
- `README_WHATSAPP_BAILEYS.md` - README del proyecto

### APIs
- `/api/whatsapp/status` - Estado de conexión
- `/api/whatsapp/send` - Enviar mensaje manual
- `/api/conversations` - Listar conversaciones
- `/api/products` - Gestionar productos

---

## 🎉 ¡Tu Bot Está Listo!

Tu bot inteligente de WhatsApp está completamente funcional:

✅ Conectado a WhatsApp real
✅ Respuestas automáticas con IA
✅ Conocimiento de tus productos
✅ Detección de intenciones
✅ Historial de conversaciones
✅ Dashboard completo

**¡Empieza a recibir y responder mensajes automáticamente!** 🚀

---

**Fecha:** 29 de Octubre, 2025  
**Versión:** 3.0 (Con IA Integrada)

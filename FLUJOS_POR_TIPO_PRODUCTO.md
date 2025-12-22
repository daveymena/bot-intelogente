# 🎯 Sistema de Flujos por Tipo de Producto

## 📦 4 Flujos Diferentes

### 1. DIGITAL (Cursos/Megapacks) ✅
```
Cliente: "curso de inglés"
↓
Bot: ¡Sí! Tenemos el Mega Pack 08: Cursos Idiomas
     ✨ Descripción...
     💰 Precio: $20.000
     ✅ Incluye: Acceso inmediato, descargable, de por vida
     ¿Te gustaría conocer los métodos de pago?
```

### 2. DROPSHIPPING (Productos de anuncios)
```
Cliente: "mouse inalámbrico"
↓
Bot: ¡Perfecto! Tenemos el Mouse Logitech M280
     📝 Características...
     💰 Precio: $45.000
     📦 Envío y Entrega:
        • Pago contraentrega 💵
        • 3-5 días hábiles 🚚
        • Envío a toda Colombia
        • Te enviamos guía de seguimiento
     ¿Te gustaría hacer el pedido?
     Solo necesito tus datos 📋
↓
Cliente: "sí"
↓
Bot: 📋 Necesito:
     • Nombre completo
     • Dirección de entrega
     • Ciudad
     • Teléfono
     Te enviamos la guía en el transcurso del día 📦
```

### 3. LOCAL (Computadores, celulares, consolas)
```
Cliente: "laptop para gaming"
↓
Bot: ¡Claro! Te cuento sobre la Laptop Asus ROG
     ✨ Características: Ryzen 7, 16GB RAM, RTX 3060...
     💰 Precio: $3.500.000
     ✅ Beneficios: Nuevo con garantía, soporte técnico
     
     🛒 Opciones de compra:
     
     1️⃣ Contraentrega 💵
        Pagas cuando recibes
        Envío: 2-3 días
     
     2️⃣ Visita nuestro local 🏪
        Puedes verlo y probarlo
        📍 [Dirección]
        🕐 Lun-Sáb 9am-6pm
     
     3️⃣ Separar con cita 📅
        Agenda un día para venir
        Te lo guardamos
     
     ¿Cuál opción prefieres?
↓
Cliente: "opción 2"
↓
Bot: ¡Genial! Te esperamos en nuestro local
     📍 Dirección: [Tu dirección]
     🕐 Horario: Lun-Sáb 9am-6pm
     📱 Teléfono: +57 300 556 0186
     ¿Necesitas indicaciones? 🗺️
```

### 4. SERVICIOS (Reparación, diagnóstico)
```
Cliente: "reparación de teléfonos"
↓
Bot: ¡Sí! Ofrecemos Reparación de teléfonos y tablets
     🔧 En qué consiste: Reparación profesional...
     💰 Precio: $20.000 (diagnóstico)
     
     📋 Proceso:
     1️⃣ Agendamos cita
     2️⃣ Revisión y diagnóstico
     3️⃣ Te informamos problema y costo
     4️⃣ Realizamos reparación
     5️⃣ Entrega con garantía
     
     ⏱️ Tiempo: 1-3 días hábiles
     ✅ Garantía incluida
     
     ¿Te gustaría agendar una cita?
↓
Cliente: "sí"
↓
Bot: 📅 Para agendar necesito:
     • Tu nombre
     • Teléfono
     • Tipo de equipo (marca/modelo)
     • Descripción del problema
     • Día preferido
     Con esta info coordinamos tu cita 📱
```

## 🔧 Cómo Funciona

El sistema detecta automáticamente el tipo de producto:

```typescript
// DIGITAL
if (category === 'DIGITAL') → Flujo Digital

// SERVICIO
if (nombre.includes('reparacion') || 'servicio') → Flujo Servicio

// DROPSHIPPING
if (nombre.includes('mouse', 'teclado', 'cable', etc.)) → Flujo Dropshipping

// LOCAL (por defecto)
else → Flujo Local (computadores, celulares, consolas)
```

## 📝 Integración

### Paso 1: Usar ProductFlowHandler

En `intelligent-conversation-engine.ts`, reemplazar la respuesta local:

```typescript
// ANTES
let response = `¡Claro! 😊 Tengo información sobre *${product.name}*...`;

// AHORA
const { ProductFlowHandler } = await import('./product-flow-handler');
const flowResponse = ProductFlowHandler.generateResponse(product, true);
let response = flowResponse.text;
```

### Paso 2: Manejar Selección de Opciones

Cuando el cliente elige una opción (1, 2, 3):

```typescript
if (userMessage.match(/^[123]$/) || userMessage.includes('opción')) {
  const flowResponse = ProductFlowHandler.handleOptionSelection(product, userMessage);
  response = flowResponse.text;
}
```

## 🎯 Beneficios

✅ **Dropshipping**: Enfoque en contraentrega y envío
✅ **Local**: 3 opciones claras para el cliente
✅ **Servicios**: Proceso claro de diagnóstico y cita
✅ **Digital**: Métodos de pago online

## 📋 Datos que se Recopilan

### Dropshipping:
- Nombre completo
- Dirección de entrega
- Ciudad
- Teléfono

### Local (Contraentrega):
- Nombre completo
- Dirección
- Ciudad
- Teléfono

### Local (Separar):
- Nombre
- Teléfono
- Día preferido

### Servicios:
- Nombre
- Teléfono
- Tipo de equipo
- Descripción del problema
- Día preferido

## 🚀 Próximos Pasos

1. Integrar `ProductFlowHandler` en el motor de conversación
2. Agregar lógica para recopilar datos del cliente
3. Guardar pedidos/citas en la base de datos
4. Enviar notificaciones al admin cuando hay un nuevo pedido

## 📍 Configuración

Actualiza la información de tu negocio en `product-flow-handler.ts`:

```typescript
// Línea ~120
text += `   📍 Dirección: [Tu dirección aquí]\n`;
text += `   🕐 Horario: Lun-Sáb 9am-6pm\n`;
```

Cambia por tu dirección y horario real.

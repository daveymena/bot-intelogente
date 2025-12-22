# PARTE 2: MÁS RESPUESTAS LOCALES

## 3. ENVÍO Y ENTREGA

**Patrones**:
```typescript
const PREGUNTAS_ENVIO = [
  '¿hacen envíos?', '¿hacen envios?', '¿envían?', '¿envian?',
  '¿cuánto cuesta el envío?', '¿cuanto cuesta el envio?',
  '¿envían a toda colombia?', '¿envian a toda colombia?',
  '¿a dónde envían?', '¿a donde envian?',
  '¿cuánto demora el envío?', '¿cuanto demora el envio?',
  '¿cuánto tarda en llegar?', '¿cuanto tarda en llegar?',
  'envío', 'envio', 'envíos', 'envios', 'entrega',
  'domicilio', 'delivery', 'shipping'
]
```

**Respuesta**:
```typescript
`📦 *Información de Envío*

✅ *Sí, hacemos envíos a toda Colombia*

🚚 *Tiempo de entrega:*
   • Bogotá: 1-2 días hábiles
   • Principales ciudades: 2-3 días hábiles
   • Resto del país: 3-5 días hábiles

💰 *Costo de envío:*
   • Varía según ciudad y peso
   • Te cotizo el envío exacto al confirmar tu pedido
   • Envío GRATIS en compras mayores a $200.000

📍 *Cobertura:*
   • Todas las ciudades principales
   • Municipios con servicio de mensajería

¿A qué ciudad necesitas el envío? 😊`
```

---

## 4. GARANTÍA

**Patrones**:
```typescript
const PREGUNTAS_GARANTIA = [
  '¿tienen garantía?', '¿tienen garantia?',
  '¿cuánto dura la garantía?', '¿cuanto dura la garantia?',
  '¿qué cubre la garantía?', '¿que cubre la garantia?',
  '¿cómo funciona la garantía?', '¿como funciona la garantia?',
  'garantía', 'garantia', 'warranty'
]
```

**Respuesta**:
```typescript
`🛡️ *Garantía de Productos*

✅ *Todos nuestros productos tienen garantía*

📦 *PRODUCTOS FÍSICOS:*
   • Garantía: 30 días
   • Cubre: Defectos de fábrica
   • Cambio o reparación sin costo

💾 *PRODUCTOS DIGITALES:*
   • Garantía: 7 días
   • Cubre: Problemas de acceso o contenido
   • Reembolso o reemplazo

📝 *Proceso de garantía:*
   1. Contactarnos con tu número de orden
   2. Describir el problema
   3. Enviamos solución en 24-48 horas

¿Tienes alguna duda específica sobre la garantía? 😊`
```

---

## 5. HORARIOS Y UBICACIÓN

**Patrones**:
```typescript
const PREGUNTAS_HORARIO = [
  '¿a qué hora abren?', '¿a que hora abren?',
  '¿cuál es el horario?', '¿cual es el horario?',
  '¿hasta qué hora atienden?', '¿hasta que hora atienden?',
  '¿están abiertos?', '¿estan abiertos?',
  'horario', 'horarios', 'hora', 'horas',
  '¿atienden los domingos?', '¿atienden sabados?'
]

const PREGUNTAS_UBICACION = [
  '¿dónde están?', '¿donde estan?',
  '¿cuál es la dirección?', '¿cual es la direccion?',
  '¿dónde quedan?', '¿donde quedan?',
  'dirección', 'direccion', 'ubicación', 'ubicacion',
  'address', 'location'
]
```

**Respuesta Horario**:
```typescript
`🕐 *Horario de Atención*

📅 *Lunes a Viernes:*
   8:00 AM - 6:00 PM

📅 *Sábados:*
   9:00 AM - 2:00 PM

📅 *Domingos y Festivos:*
   Cerrado

💬 *Atención por WhatsApp:*
   Respondemos en horario laboral
   Mensajes fuera de horario se responden al día siguiente

📱 WhatsApp: +57 300 556 0186

¿En qué más puedo ayudarte? 😊`
```

**Respuesta Ubicación**:
```typescript
`📍 *Ubicación*

🏢 *Tecnovariedades D&S*
   Colombia

📱 *Contacto:*
   WhatsApp: +57 300 556 0186
   Email: deinermena25@gmail.com

💻 *Tienda Online:*
   Atendemos a todo Colombia
   Envíos a nivel nacional

🌐 *Redes Sociales:*
   [Enlaces a redes sociales]

¿Necesitas algo más? 😊`
```

---

## 6. DISPONIBILIDAD Y STOCK

**Patrones**:
```typescript
const PREGUNTAS_DISPONIBILIDAD = [
  '¿está disponible?', '¿esta disponible?',
  '¿tienen en stock?', '¿tienen stock?',
  '¿hay disponibilidad?', '¿hay disponible?',
  '¿cuándo llega?', '¿cuando llega?',
  '¿cuándo tienen?', '¿cuando tienen?',
  'disponible', 'disponibilidad', 'stock',
  '¿lo tienen?', '¿lo tienen disponible?'
]
```

**Respuesta**:
```typescript
`📦 *Disponibilidad de Productos*

Para verificar la disponibilidad exacta, necesito saber:

¿Qué producto te interesa? 🤔

Puedo ayudarte con:
💻 Laptops y computadores
🎹 Cursos digitales
📦 Megapacks de recursos
🏍️ Motos

Una vez me digas el producto, te confirmo:
✅ Disponibilidad inmediata
📅 Tiempo de entrega
💰 Precio actualizado

¿Cuál producto te interesa? 😊`
```

---

## 7. AGRADECIMIENTOS Y CONFIRMACIONES

**Patrones**:
```typescript
const AGRADECIMIENTOS = [
  'gracias', 'muchas gracias', 'mil gracias',
  'thank you', 'thanks', 'thx',
  'te agradezco', 'agradecido',
  '🙏', '👍', '👌'
]

const CONFIRMACIONES = [
  'ok', 'okay', 'vale', 'entendido', 'perfecto',
  'listo', 'dale', 'si', 'sí', 'claro',
  'de acuerdo', 'está bien', 'esta bien',
  '👍', '👌', '✅', '✔️'
]
```

**Respuesta Agradecimiento**:
```typescript
`¡Con mucho gusto! 😊

Es un placer ayudarte. Si necesitas algo más, aquí estoy.

¿Hay algo más en lo que pueda ayudarte? 💬`
```

**Respuesta Confirmación**:
```typescript
`¡Perfecto! 👍

¿Continuamos con algo más o necesitas ayuda adicional? 😊`
```

---

## 8. PREGUNTAS SOBRE EL NEGOCIO

**Patrones**:
```typescript
const PREGUNTAS_NEGOCIO = [
  '¿quiénes son?', '¿quienes son?',
  '¿qué venden?', '¿que venden?',
  '¿a qué se dedican?', '¿a que se dedican?',
  'sobre ustedes', 'información', 'informacion',
  '¿son confiables?', '¿son de confianza?',
  '¿son legítimos?', '¿son legitimos?'
]
```

**Respuesta**:
```typescript
`🏢 *Sobre Tecnovariedades D&S*

Somos una empresa colombiana especializada en:

💻 *Tecnología*
   Laptops, computadores y accesorios

🎓 *Educación Digital*
   Cursos profesionales online
   Megapacks de recursos

🏍️ *Motos*
   Venta de motocicletas

✅ *Nuestro Compromiso:*
   • Productos de calidad
   • Precios competitivos
   • Garantía en todos los productos
   • Envíos a toda Colombia
   • Atención personalizada

📱 *Contacto:*
   WhatsApp: +57 300 556 0186
   Email: deinermena25@gmail.com

¿En qué podemos ayudarte hoy? 😊`
```

---

Continúa en PARTE 3...

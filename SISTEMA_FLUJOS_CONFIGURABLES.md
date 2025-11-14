# 🎯 SISTEMA DE FLUJOS DE VENTA CONFIGURABLES

## ¿Qué es?

Un sistema universal que adapta automáticamente el flujo de conversación del bot según el tipo de negocio configurado por el usuario en el dashboard.

## Tipos de Negocio Soportados

### 1. 🛒 ECOMMERCE
Tienda online con productos físicos en stock
- Muestra productos con fotos
- Opciones de envío o pickup
- Captura datos de entrega

### 2. 📦 DROPSHIPPING
Productos con envío desde proveedor
- Pago contraentrega
- Tiempo de entrega configurable (ej: 4-5 días)
- Captura datos completos del cliente
- Ideal para productos desde Facebook/Instagram

### 3. 🏪 PHYSICAL_STORE
Tienda física con punto de venta
- Invita a visitar la tienda
- Muestra dirección y horarios
- Opción de apartar productos
- Agenda visitas

### 4. 💼 SERVICES
Servicios profesionales (vendedor, consultor, asesor)
- Explica el servicio
- Muestra precios de consultoría
- Agenda llamadas o reuniones
- Captura necesidades del cliente

### 5. 📅 APPOINTMENTS
Servicios con citas (clínica, peluquería, spa, taller)
- Sistema de agendamiento
- Muestra disponibilidad
- Confirma citas
- Envía recordatorios

### 6. 💻 DIGITAL_PRODUCTS
Productos digitales (cursos, megapacks, ebooks)
- Entrega inmediata
- Envío por WhatsApp o email
- Links de pago
- Acceso instantáneo

### 7. 🔄 HYBRID
Combinación de varios tipos
- Adapta el flujo según el producto
- Múltiples opciones de entrega
- Flexible y personalizable

## Configuración en Dashboard

### Campos Configurables

#### Información Básica
- `businessType`: Tipo de negocio (seleccionar uno de los anteriores)
- `welcomeMessage`: Mensaje de bienvenida personalizado
- `priceMessage`: Mensaje al mostrar precios
- `deliveryMessage`: Mensaje sobre entregas
- `confirmationMessage`: Mensaje de confirmación de pedido

#### Dropshipping
- `dropshippingEnabled`: Activar modo dropshipping
- `deliveryDays`: Tiempo de entrega (ej: "4-5 días hábiles")
- `paymentOnDelivery`: Permitir pago contraentrega

#### Tienda Física
- `hasPhysicalStore`: Tiene tienda física
- `storeAddress`: Dirección de la tienda
- `storeHours`: Horario de atención (JSON)
- `allowPickup`: Permitir recoger en tienda

#### Servicios con Citas
- `requiresAppointment`: Requiere agendar cita
- `appointmentDuration`: Duración de cita (minutos)
- `advanceBookingDays`: Días de anticipación para agendar

#### Servicios Profesionales
- `consultationEnabled`: Ofrecer consultas
- `consultationPrice`: Precio de consulta
- `consultationDuration`: Duración de consulta (minutos)

#### Captura de Datos
- `requireName`: Solicitar nombre completo
- `requirePhone`: Solicitar teléfono
- `requireEmail`: Solicitar email
- `requireAddress`: Solicitar dirección
- `requireCity`: Solicitar ciudad
- `requireNotes`: Solicitar notas adicionales

#### Opciones de Productos
- `showColors`: Mostrar opciones de color
- `showSizes`: Mostrar opciones de talla
- `showVariants`: Mostrar variantes

#### Redes Sociales
- `facebookEnabled`: Detectar consultas desde Facebook
- `instagramEnabled`: Detectar consultas desde Instagram
- `detectSocialMedia`: Activar detección automática

## Cómo Funciona

### 1. Detección Automática
El bot detecta automáticamente cuando un cliente:
- Menciona que vio algo en Facebook/Instagram
- Pregunta por un producto/servicio
- Solicita información de precios
- Quiere agendar una cita

### 2. Flujo Adaptativo
Según la configuración del usuario, el bot:
- Usa el saludo personalizado
- Ofrece las opciones correctas (envío, pickup, cita, etc.)
- Captura solo los datos necesarios
- Genera el mensaje de confirmación apropiado

### 3. Captura de Datos Inteligente
El bot extrae automáticamente:
- Nombre completo
- Teléfono (10 dígitos)
- Email (formato válido)
- Dirección (calle, carrera, etc.)
- Ciudad (detecta ciudades principales de Colombia)
- Color/talla (si está configurado)

### 4. Registro de Órdenes
Cada pedido se guarda con:
- Datos del cliente
- Producto(s) solicitado(s)
- Método de entrega
- Estado del pedido
- Timestamp

## Ejemplos de Uso

### Ejemplo 1: Dropshipping (Bolso Antirobo)

**Cliente:** "Hola, vi el bolso antirobo en Facebook"

**Bot:** "¡Hola 👋! Sí, claro que sí 😎. Soy Laura de MegaComputer.

El *Bolso Antirobo Manos Libres* está disponible, ¿verdad?

¿Deseas que te cuente los detalles o prefieres saber directamente el precio y forma de entrega?"

**Cliente:** "Cuánto cuesta?"

**Bot:** "El precio es *$89.900 COP*

Lo mejor 👉 lo puedes pagar al recibirlo (contraentrega).
Demora 4-5 días hábiles 🛵📦

¿Te gustaría que lo enviemos a tu domicilio o prefieres recogerlo?"

### Ejemplo 2: Servicios con Citas (Peluquería)

**Cliente:** "Necesito una cita para corte de cabello"

**Bot:** "¡Hola 👋! Perfecto, te puedo ayudar a agendar una cita.

¿Qué día y hora te vendría mejor? Atendemos de lunes a sábado de 9am a 7pm."

**Cliente:** "Mañana a las 3pm"

**Bot:** "Perfecto ✅ Te agendo para mañana a las 3:00 PM.

¿Me confirmas tu nombre completo y teléfono para la cita?"

### Ejemplo 3: Productos Digitales (Curso)

**Cliente:** "Me interesa el curso de Excel"

**Bot:** "¡Hola 👋! El *Curso Completo de Excel* está disponible para entrega inmediata.

¿Te gustaría conocer el contenido completo o prefieres saber el precio y forma de pago?"

**Cliente:** "Precio"

**Bot:** "El precio es *$49.900 COP*

Entrega inmediata por WhatsApp o email 📧

¿Cómo prefieres recibirlo?"

## Instalación

### 1. Aplicar Migración
```bash
npm run aplicar-migracion-flujos.bat
```

O manualmente:
```bash
npx prisma generate
npx prisma db push
```

### 2. Reiniciar Servidor
```bash
npm run dev
```

### 3. Configurar en Dashboard
1. Ir a Dashboard → Configuración → Flujos de Venta
2. Seleccionar tipo de negocio
3. Configurar opciones específicas
4. Guardar cambios

## API

### GET /api/sales-flow-config
Obtiene la configuración actual del flujo

### POST /api/sales-flow-config
Actualiza la configuración del flujo

**Body:**
```json
{
  "businessType": "DROPSHIPPING",
  "dropshippingEnabled": true,
  "deliveryDays": "4-5 días hábiles",
  "paymentOnDelivery": true,
  "requireName": true,
  "requirePhone": true,
  "requireAddress": true,
  "requireCity": true,
  "showColors": true
}
```

## Ventajas

✅ **Un solo sistema** para todos los tipos de negocio
✅ **Configuración visual** desde el dashboard
✅ **Sin código** - solo configurar opciones
✅ **Adaptación automática** según el tipo de negocio
✅ **Captura inteligente** de datos del cliente
✅ **Registro de órdenes** automático
✅ **Escalable** - fácil agregar nuevos tipos

## Próximas Mejoras

- [ ] Interfaz visual en dashboard para configurar flujos
- [ ] Plantillas predefinidas por industria
- [ ] Editor de mensajes con preview en tiempo real
- [ ] Integración con calendarios para citas
- [ ] Notificaciones automáticas al admin
- [ ] Reportes de conversiones por flujo
- [ ] A/B testing de mensajes
- [ ] Flujos multi-idioma

## Soporte

Para cualquier duda o problema:
1. Revisa este documento
2. Verifica la configuración en el dashboard
3. Revisa los logs del servidor
4. Contacta soporte técnico

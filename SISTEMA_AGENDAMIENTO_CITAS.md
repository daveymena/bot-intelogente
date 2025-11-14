# 📅 SISTEMA DE AGENDAMIENTO DE CITAS

## ✅ Implementado

Sistema completo de agendamiento con notificación al admin y confirmación automática.

## 🎯 Cómo Funciona

### Flujo Completo:

```
1. Cliente solicita cita
   ↓
2. Bot detecta solicitud
   ↓
3. Bot notifica al admin (3005560186)
   ↓
4. Admin responde con disponibilidad
   ↓
5. Bot confirma cita con el cliente
```

## 📊 Ejemplo de Conversación

### Paso 1: Cliente Solicita Cita

```
Cliente: "Puedo ir a ver la moto?"

Bot: 📅 *Solicitud de Cita Recibida*

     ¡Perfecto! He recibido tu solicitud para visitarnos 😊
     
     📍 *Ubicación:*
     Centro Comercial El Diamante 2, San Nicolás, Cali
     
     📞 *Contacto:*
     +57 304 274 8687
     
     ⏰ *Horario:*
     Lunes a Sábado: 9:00 AM - 6:00 PM
     
     🔔 He notificado a nuestro equipo sobre tu solicitud.
     Te confirmaremos la disponibilidad en breve.
```

### Paso 2: Admin Recibe Notificación

```
Admin (3005560186) recibe:

🔔 *NUEVA SOLICITUD DE CITA*

👤 *Cliente:* Juan Pérez
📱 *Teléfono:* 573001234567
💬 *Mensaje:* Puedo ir a ver la moto?

📅 *ID de Cita:* clxyz123abc

⏰ *Para confirmar la cita:*
Responde con: CITA clxyz123abc [FECHA] [HORA]

Ejemplo:
CITA clxyz123abc 2025-11-10 14:00
```

### Paso 3: Admin Responde

```
Admin responde:
"CITA clxyz123abc 2025-11-10 14:00"
```

### Paso 4: Cliente Recibe Confirmación

```
Cliente recibe automáticamente:

✅ *Cita Confirmada*

¡Excelente noticia! Tu cita ha sido confirmada 🎉

📅 *Fecha:* Domingo, 10 de noviembre de 2025

⏰ *Hora:* 14:00

📍 *Ubicación:*
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 *Contacto:*
+57 304 274 8687

💡 *Recuerda:*
- Llegar 5 minutos antes
- Si necesitas cambiar la cita, avísanos con anticipación

¡Te esperamos! 😊
```

## 🔧 Configuración

### 1. Actualizar Base de Datos

```bash
# Aplicar migración
npx prisma db push

# Generar cliente de Prisma
npx prisma generate
```

### 2. Configurar Información del Negocio

Actualiza la información en la base de datos:

```sql
UPDATE users 
SET 
  businessAddress = 'Centro Comercial El Diamante 2, San Nicolás, Cali',
  businessPhone = '+57 304 274 8687',
  businessHours = 'Lunes a Sábado: 9:00 AM - 6:00 PM',
  businessDescription = 'Tecnovariedades D&S - Tecnología, cursos y herramientas digitales',
  adminNotificationPhone = '3005560186'
WHERE email = 'daveymena16@gmail.com';
```

O desde el dashboard (crear interfaz):

```typescript
// En el dashboard, agregar formulario para editar:
- Dirección del negocio
- Teléfono de contacto
- Horario de atención
- Descripción del negocio
- Teléfono para notificaciones
```

### 3. Integrar en Baileys Service

Agregar al archivo `src/lib/baileys-stable-service.ts`:

```typescript
// Al inicio del archivo
import { AppointmentService } from './appointment-service'

// En la función setupMessageHandler, después de procesar el mensaje:

// 📅 DETECTAR SOLICITUD DE CITA
if (AppointmentService.detectAppointmentRequest(messageText)) {
  console.log(`[Baileys] 📅 Solicitud de cita detectada`)
  
  const result = await AppointmentService.createAppointmentRequest(
    socket,
    userId,
    from,
    `Cliente ${from.split('@')[0].slice(-4)}`,
    messageText,
    conversation.id
  )
  
  if (result.success) {
    await socket.sendMessage(from, { text: result.message })
    
    // Guardar en BD
    await db.message.create({
      data: {
        conversationId: conversation.id,
        content: result.message,
        direction: 'OUTGOING',
        type: 'TEXT'
      }
    })
    
    return // No procesar más, ya respondimos
  }
}

// 📅 DETECTAR RESPUESTA DEL ADMIN
if (from.includes('3005560186')) {
  const processed = await AppointmentService.processAdminResponse(
    socket,
    messageText,
    userId
  )
  
  if (processed) {
    return // Era una respuesta de cita, ya procesada
  }
}
```

## 🎯 Patrones Detectados

El bot detecta estas frases como solicitud de cita:

- "Puedo ir a ver..."
- "Quiero visitar..."
- "Dónde están ubicados?"
- "Cuál es la dirección?"
- "Horario de atención"
- "Agendar una cita"
- "Quiero conocer el local"

## 📝 Formato de Respuesta del Admin

**Formato correcto**:
```
CITA [ID] [FECHA] [HORA]
```

**Ejemplos válidos**:
```
CITA clxyz123abc 2025-11-10 14:00
CITA abc123xyz 2025-12-15 10:30
```

**Formato de fecha**: `YYYY-MM-DD`
**Formato de hora**: `HH:MM` (24 horas)

## 🗄️ Base de Datos

### Tabla: appointments

```sql
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerName TEXT,
  conversationId TEXT,
  status TEXT DEFAULT 'PENDING_ADMIN_APPROVAL',
  requestedDate TIMESTAMP,
  requestedTime TEXT,
  confirmedDate TIMESTAMP,
  confirmedTime TEXT,
  adminResponse TEXT,
  customerMessage TEXT,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Estados de Cita:

- `PENDING_ADMIN_APPROVAL`: Esperando respuesta del admin
- `CONFIRMED`: Cita confirmada
- `CANCELLED`: Cita cancelada
- `COMPLETED`: Cita completada

## 📊 Consultas Útiles

### Ver citas pendientes:

```sql
SELECT * FROM appointments 
WHERE status = 'PENDING_ADMIN_APPROVAL'
ORDER BY createdAt DESC;
```

### Ver citas confirmadas:

```sql
SELECT * FROM appointments 
WHERE status = 'CONFIRMED'
AND confirmedDate >= CURRENT_DATE
ORDER BY confirmedDate, confirmedTime;
```

## 🔒 Información del Negocio

### El bot SIEMPRE usa la información real de la BD:

```typescript
const user = await db.user.findUnique({
  where: { id: userId },
  select: {
    businessName: true,
    businessAddress: true,
    businessPhone: true,
    businessHours: true,
    businessDescription: true
  }
})
```

### NO inventa información:

❌ **ANTES**: Bot inventaba direcciones
✅ **AHORA**: Bot usa SOLO la información de la BD

## 🧪 Cómo Probar

### 1. Actualizar BD:

```bash
npx prisma db push
npx prisma generate
```

### 2. Configurar información del negocio:

```sql
UPDATE users SET 
  businessAddress = 'Tu dirección real',
  businessPhone = 'Tu teléfono real',
  businessHours = 'Tu horario real',
  adminNotificationPhone = '3005560186'
WHERE id = 'tu-user-id';
```

### 3. Probar flujo:

```
1. Envía: "Puedo ir a ver el producto?"
2. Verifica que recibes notificación en 3005560186
3. Responde: "CITA [ID] 2025-11-10 14:00"
4. Verifica que el cliente recibe confirmación
```

## ✅ Beneficios

### Para el Cliente:
- ✅ Proceso simple y rápido
- ✅ Confirmación automática
- ✅ Información clara de ubicación
- ✅ Recordatorio de la cita

### Para el Negocio:
- ✅ Notificación inmediata
- ✅ Control total de disponibilidad
- ✅ Registro de todas las citas
- ✅ Proceso automatizado

## 📱 Notificaciones

### Admin recibe notificación en:
- Teléfono configurado en `adminNotificationPhone`
- Por defecto: `3005560186`

### Cliente recibe:
- Confirmación de solicitud (inmediata)
- Confirmación de cita (cuando admin responde)

## 🎯 Próximos Pasos

1. **Aplicar migración**: `npx prisma db push`
2. **Configurar info del negocio**: Actualizar en BD
3. **Integrar en baileys-service**: Agregar código de detección
4. **Probar**: Solicitar cita y confirmar

---

**Archivos creados**:
- `src/lib/appointment-service.ts`
- `prisma/migrations/add_business_info_and_appointments.sql`
- `prisma/schema.prisma` (actualizado)

**Estado**: ✅ LISTO PARA IMPLEMENTAR

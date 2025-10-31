# 📅 SISTEMA DE AGENDAMIENTO DE CITAS

## ✅ Sistema Implementado

El bot ahora puede agendar citas automáticamente. Recopila la información del cliente y te notifica para que confirmes.

## 🎯 Cómo Funciona

### Cliente solicita cita:
```
"Quiero agendar una cita para ver la moto"
"Puedo ir a ver el producto?"
"Quiero visitar el local"
```

### Bot responde:
```
¡Claro! Con gusto agendamos una cita. 📅

Para coordinar mejor, cuéntame:
1️⃣ ¿Qué producto o servicio quieres ver?
2️⃣ ¿Qué día te gustaría venir?
3️⃣ ¿Prefieres en la mañana o en la tarde?

📍 Ubicación:
Centro Comercial El Diamante 2, San Nicolás, Cali

📞 Confirma tu cita al:
313 617 4267

Te esperamos! 😊
```

### Tú recibes notificación:
```
🔔 NUEVO CASO - CITA

👤 Cliente: Juan Pérez
📱 Teléfono: +57 300 123 4567
📝 Mensaje: "Quiero agendar una cita para ver la moto"

📋 Información recopilada:
1. Producto: Moto Bajaj Pulsar
2. Día: Mañana
3. Horario: Tarde

⏰ Hora: 29/10/2025, 15:30

💬 Responde al cliente:
https://wa.me/573001234567
```

## 🔍 Palabras Clave que Detecta

El bot detecta automáticamente:
- ✅ "agendar cita"
- ✅ "quiero una cita"
- ✅ "puedo ir a ver"
- ✅ "visitar el local"
- ✅ "ver la moto"
- ✅ "ver el producto"
- ✅ "ir a ver"
- ✅ "reservar"

## 💬 Ejemplos de Conversación

### Ejemplo 1: Cita para ver la moto
```
Cliente: "Quiero agendar una cita para ver la moto"

Bot: "¡Claro! Con gusto agendamos una cita. 📅
Para coordinar mejor, cuéntame:
1️⃣ ¿Qué producto quieres ver?
2️⃣ ¿Qué día te gustaría venir?
3️⃣ ¿Prefieres mañana o tarde?"

Cliente: "La Pulsar, mañana en la tarde"

Bot: "Perfecto! Te confirmo:
📅 Mañana en la tarde
🏍️ Ver Moto Pulsar
📍 Centro Comercial El Diamante 2

📞 Confirma al: 313 617 4267"

[Tú recibes notificación con todos los datos]
```

### Ejemplo 2: Cita para reparación
```
Cliente: "Puedo llevar mi laptop mañana?"

Bot: "¡Claro! Con gusto te agendamos. 📅
1️⃣ ¿Qué servicio necesitas?
2️⃣ ¿Qué día prefieres?
3️⃣ ¿Mañana o tarde?"

Cliente: "Reparación, mañana a las 10am"

Bot: "Perfecto! Te esperamos:
📅 Mañana 10am
💻 Reparación de laptop
📍 Centro Comercial El Diamante 2

📞 Confirma al: 313 617 4267"

[Tú recibes notificación]
```

### Ejemplo 3: Cita para ver laptops
```
Cliente: "Quiero ir a ver las laptops"

Bot: "¡Perfecto! Te esperamos. 📅
1️⃣ ¿Qué laptop te interesa?
2️⃣ ¿Qué día vienes?
3️⃣ ¿Mañana o tarde?"

Cliente: "La ASUS VivoBook, hoy en la tarde"

Bot: "Genial! Te confirmamos:
📅 Hoy en la tarde
💻 Ver ASUS VivoBook
📍 Centro Comercial El Diamante 2

📞 Confirma al: 313 617 4267"

[Tú recibes notificación]
```

## 📱 Notificación que Recibes

```
🔔 NUEVO CASO - CITA

👤 Cliente: María González
📱 Teléfono: +57 315 890 1234
📝 Mensaje: "Quiero agendar una cita para ver la moto"

📋 Información recopilada:
1. Producto: Moto Bajaj Pulsar NS 160
2. Día: Mañana (30/10/2025)
3. Horario: Tarde (3pm - 6pm)

⏰ Solicitud: 29/10/2025, 15:30:45

💬 Responde directamente al cliente:
https://wa.me/573158901234
```

## 🔄 Flujo Completo

```
1. Cliente solicita cita
   ↓
2. Bot detecta: CITA
   ↓
3. Bot hace preguntas:
   - ¿Qué producto/servicio?
   - ¿Qué día?
   - ¿Qué horario?
   ↓
4. Cliente responde
   ↓
5. Bot confirma datos
   ↓
6. Bot te notifica a ti (313 617 4267)
   ↓
7. Tú confirmas con el cliente
```

## 📍 Ubicación Incluida

El bot siempre menciona:
```
📍 Ubicación:
Centro Comercial El Diamante 2
San Nicolás, Cali
```

## 🎯 Casos de Uso

### 1. Ver Productos Físicos
- Ver la moto
- Ver laptops
- Ver productos en persona

### 2. Servicios Técnicos
- Llevar laptop para reparación
- Llevar PC para mantenimiento
- Diagnóstico presencial

### 3. Asesoría Presencial
- Ver opciones de laptops
- Comparar productos
- Recibir asesoría técnica

## ✅ Ventajas

### Para el Cliente:
✅ Proceso simple y rápido
✅ Confirmación inmediata
✅ Ubicación clara
✅ Contacto directo

### Para Ti:
✅ Notificación automática
✅ Información organizada
✅ Datos del cliente
✅ Link directo para confirmar

## 🔧 Configuración

### Ubicación:
```typescript
// En la respuesta del bot
📍 Ubicación:
Centro Comercial El Diamante 2, San Nicolás, Cali
```

### Cambiar Ubicación:
Edita en `src/lib/human-escalation-service.ts`:
```typescript
CITA: `...
📍 *Ubicación:*
[Tu nueva ubicación]
...`
```

## 🚀 Probar el Sistema

### Prueba 1:
```
Tú (como cliente): "Quiero agendar una cita para ver la moto"
Bot: ✅ Responde con preguntas
Tú (como admin): ✅ Recibes notificación en 313 617 4267
```

### Prueba 2:
```
Tú: "Puedo ir mañana a ver las laptops?"
Bot: ✅ Agenda la cita
Tú: ✅ Recibes notificación
```

### Prueba 3:
```
Tú: "Quiero llevar mi PC para reparación"
Bot: ✅ Agenda + Recopila info
Tú: ✅ Recibes notificación completa
```

## 📊 Categorías de Escalamiento

| Categoría | Descripción | Notificación |
|-----------|-------------|--------------|
| CITA | Agendar visita | ✅ Sí |
| REPARACION | Servicio técnico | ✅ Sí |
| MANTENIMIENTO | Mantenimiento PC | ✅ Sí |
| COTIZACION | Solicitar precio | ✅ Sí |
| ASESORIA | Asesoría compra | ✅ Sí |

## ✅ Resultado Final

Ahora cuando un cliente quiera agendar una cita:

1. ✅ El bot recopila la información
2. ✅ Confirma fecha, hora y ubicación
3. ✅ Te notifica automáticamente
4. ✅ El cliente recibe tu número
5. ✅ Tú confirmas la cita personalmente

¡El sistema de citas está completamente funcional! 📅🎉

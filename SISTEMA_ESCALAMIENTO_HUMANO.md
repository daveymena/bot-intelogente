# 👨‍💼 SISTEMA DE ESCALAMIENTO A HUMANO

## ✅ Sistema Implementado

El bot ahora detecta automáticamente cuando un cliente necesita atención personalizada y te notifica a ti (313 617 4267) para que tomes el caso.

## 🎯 Casos que Escalan Automáticamente

### 1. 🔧 REPARACIÓN
**Detecta:**
- "Reparación de computadores"
- "Arreglar mi laptop"
- "Mi PC está dañado"
- "No funciona mi computador"

**Respuesta del Bot:**
```
¡Claro! Sí ofrecemos servicio de reparación. 🔧

Para darte un diagnóstico preciso:
1️⃣ ¿Qué marca y modelo es tu computador?
2️⃣ ¿Qué problema presenta?
3️⃣ ¿Cuándo comenzó?

📞 Llámame al: 313 617 4267
Te responderé personalmente.
```

**Notificación a Ti:**
```
🔔 NUEVO CASO - REPARACION

👤 Cliente: Juan Pérez
📱 Teléfono: +57 300 123 4567
📝 Mensaje: "Necesito reparar mi laptop"

⏰ Hora: 29/10/2025, 15:30

💬 Responde al cliente:
https://wa.me/573001234567
```

### 2. 🛠️ MANTENIMIENTO
**Detecta:**
- "Mantenimiento de computadores"
- "Formatear mi PC"
- "Limpieza de laptop"
- "Instalar Windows"

### 3. 💰 COTIZACIÓN
**Detecta:**
- "Cuánto cuesta reparar"
- "Precio de mantenimiento"
- "Cotización de servicio"

### 4. 💡 ASESORÍA
**Detecta:**
- "Qué computador me recomiendas"
- "Cuál es mejor para..."
- "Asesoría para comprar"

## 🔄 Flujo Completo

```
1. Cliente pregunta: "Tienen reparación de computadores?"

2. Bot detecta: Necesita escalamiento (REPARACION)

3. Bot responde al cliente:
   - Confirma que SÍ tienen el servicio
   - Hace preguntas para recopilar info
   - Da tu número: 313 617 4267

4. Bot te notifica a ti:
   - Categoría del caso
   - Datos del cliente
   - Mensaje original
   - Link directo para responder

5. Tú tomas el caso:
   - Recibes la notificación en tu WhatsApp
   - Tienes toda la información
   - Respondes directamente al cliente
```

## 📱 Ejemplo Real

### Cliente escribe:
```
"Hola, tienen reparación de computadores? 
Mi laptop no enciende"
```

### Bot responde al cliente:
```
¡Claro! Sí ofrecemos servicio de reparación. 🔧

Para darte un diagnóstico preciso:
1️⃣ ¿Qué marca y modelo es tu laptop?
2️⃣ ¿Qué problema presenta exactamente?
3️⃣ ¿Cuándo comenzó el problema?

📞 También puedes llamarme al:
313 617 4267

Te responderé personalmente. 😊
```

### Tú recibes en tu WhatsApp (313 617 4267):
```
🔔 NUEVO CASO - REPARACION

👤 Cliente: Cliente 4567
📱 Teléfono: +57 300 123 4567
📝 Mensaje: "Hola, tienen reparación de computadores? Mi laptop no enciende"

⏰ Hora: 29/10/2025, 15:30:45

💬 Responde directamente al cliente:
https://wa.me/573001234567
```

### Cliente responde:
```
"Es una HP Pavilion, no enciende desde ayer"
```

### Tú respondes directamente:
```
"Hola! Soy [Tu Nombre]. 
Revisemos tu HP Pavilion.
¿Puedes traerla mañana a las 10am?
Ubicación: [Tu dirección]"
```

## 🎯 Ventajas

### Para el Cliente:
✅ Respuesta inmediata del bot
✅ Confirmación de que SÍ tienen el servicio
✅ Recopilación de información básica
✅ Contacto directo contigo

### Para Ti:
✅ Notificación automática de casos
✅ Información del cliente organizada
✅ Link directo para responder
✅ Historial guardado en DB

## 🔧 Configuración

### Tu Número de Contacto:
```typescript
// En src/lib/human-escalation-service.ts
private static ADMIN_PHONE = '573136174267'
```

### Cambiar el Número:
Si necesitas cambiar el número, edita el archivo:
```typescript
private static ADMIN_PHONE = '57XXXXXXXXXX' // Tu nuevo número
```

## 📊 Categorías de Escalamiento

| Categoría | Palabras Clave | Acción |
|-----------|----------------|--------|
| REPARACION | reparar, arreglar, dañado, no funciona | Notifica + Recopila info |
| MANTENIMIENTO | mantenimiento, formatear, limpiar | Notifica + Recopila info |
| COTIZACION | cotización, precio, cuánto cuesta | Notifica + Solicita detalles |
| ASESORIA | recomendar, cuál es mejor, asesoría | Notifica + Pregunta necesidades |

## 🚀 Cómo Probar

### Prueba 1: Reparación
```
Cliente: "Tienen reparación de computadores?"
Bot: ✅ Responde que SÍ + Hace preguntas + Da tu número
Tú: ✅ Recibes notificación en 313 617 4267
```

### Prueba 2: Mantenimiento
```
Cliente: "Necesito formatear mi laptop"
Bot: ✅ Responde que SÍ + Hace preguntas + Da tu número
Tú: ✅ Recibes notificación
```

### Prueba 3: Cotización
```
Cliente: "Cuánto cuesta reparar una laptop?"
Bot: ✅ Responde + Solicita detalles + Da tu número
Tú: ✅ Recibes notificación
```

## 📝 Logs

Verás en la consola:
```
[AI] 👨‍💼 Escalamiento detectado: REPARACION
[Escalation] 📢 Notificando al admin sobre caso: REPARACION
[Escalation] ✅ Notificación enviada al admin
```

## ✅ Resultado Final

Ahora cuando un cliente pregunte por servicios técnicos:

1. ✅ El bot confirma que SÍ tienen el servicio
2. ✅ Recopila información básica
3. ✅ Te notifica automáticamente
4. ✅ El cliente recibe tu número directo
5. ✅ Tú tomas el caso personalmente

¡El bot ya no dirá "No tengo ese servicio"! Ahora escala correctamente a ti. 🎉

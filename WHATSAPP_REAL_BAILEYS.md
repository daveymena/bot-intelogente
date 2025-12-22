# 🚀 Sistema Real de WhatsApp con Baileys

## ✅ Implementación Completada

Hemos integrado **Baileys** (WhatsApp Web.js) para conectar WhatsApp de forma REAL.

### 🎯 Características Implementadas

1. **QR Real de WhatsApp**
   - Se genera un QR auténtico de WhatsApp
   - El QR se muestra en el dashboard
   - Se puede escanear con la app de WhatsApp

2. **Conexión Persistente**
   - Las sesiones se guardan en `auth_sessions/`
   - La conexión se mantiene entre reinicios
   - Reconexión automática si se pierde la conexión

3. **Mensajes Reales**
   - Recibe mensajes entrantes de WhatsApp
   - Envía mensajes a través de WhatsApp
   - Guarda conversaciones en la base de datos

4. **Estado en Tiempo Real**
   - Monitorea el estado de conexión
   - Actualiza automáticamente el QR
   - Detecta desconexiones

---

## 📋 Cómo Usar

### 1. Iniciar el Sistema

```bash
npm run dev
```

### 2. Conectar WhatsApp

1. Ve al dashboard: http://localhost:3000/dashboard
2. Haz clic en "Conexión WhatsApp" en el menú
3. Haz clic en "Conectar WhatsApp"
4. **Espera 5-10 segundos** mientras se genera el QR real
5. Verás el código QR en pantalla

### 3. Escanear el QR

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración** → **Dispositivos vinculados**
3. Toca **"Vincular un dispositivo"**
4. Escanea el código QR que aparece en el dashboard
5. ¡Listo! Tu WhatsApp está conectado

### 4. Verificar Conexión

- El estado cambiará a "CONNECTED" (verde)
- Verás tu número de teléfono
- El bot empezará a recibir mensajes

---

## 🔧 Archivos Importantes

### Backend (Baileys)
- `src/lib/baileys-service.ts` - Servicio principal de Baileys
- `src/app/api/whatsapp/connect/route.ts` - API para conectar
- `src/app/api/whatsapp/status/route.ts` - API para estado
- `src/app/api/whatsapp/send/route.ts` - API para enviar mensajes
- `src/app/api/whatsapp/disconnect/route.ts` - API para desconectar

### Frontend
- `src/components/dashboard/WhatsAppConnection.tsx` - Componente de conexión

### Sesiones
- `auth_sessions/[userId]/` - Archivos de sesión de WhatsApp (NO subir a Git)

---

## 📱 Funcionalidades

### ✅ Recibir Mensajes

Cuando alguien te envía un mensaje por WhatsApp:
1. El mensaje se recibe automáticamente
2. Se guarda en la base de datos
3. Aparece en el dashboard de conversaciones
4. Se puede responder desde el dashboard

### ✅ Enviar Mensajes

Para enviar un mensaje:

```javascript
// Desde el código
await BaileysService.sendMessage(userId, '+573001234567', 'Hola!')

// Desde la API
fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: '+573001234567@s.whatsapp.net',
    content: 'Hola desde el bot!'
  })
})
```

### ✅ Desconectar

Para desconectar WhatsApp:
1. Ve al dashboard de conexión
2. Haz clic en "Desconectar"
3. Esto cierra la sesión y elimina los archivos de autenticación

---

## 🐛 Solución de Problemas

### El QR no aparece

1. Verifica que el servidor esté corriendo
2. Revisa la consola del servidor (terminal)
3. El QR también se imprime en la consola
4. Espera 10 segundos, a veces tarda

### Error de conexión

1. Asegúrate de tener internet estable
2. Verifica que WhatsApp funcione en tu teléfono
3. Intenta desconectar y volver a conectar
4. Revisa los logs del servidor

### Sesión expirada

1. Ve a WhatsApp → Dispositivos vinculados
2. Elimina el dispositivo "WhatsApp Bot"
3. Vuelve a escanear el QR

### No recibe mensajes

1. Verifica que el estado sea "CONNECTED"
2. Envía un mensaje de prueba a tu número
3. Revisa los logs del servidor
4. Asegúrate de que la sesión no haya expirado

---

## 🔒 Seguridad

### Archivos de Sesión

Los archivos en `auth_sessions/` contienen las credenciales de WhatsApp:
- **NO** los subas a Git (ya están en .gitignore)
- **NO** los compartas con nadie
- Son únicos para cada usuario
- Se eliminan al desconectar

### Recomendaciones

1. Usa HTTPS en producción
2. Protege las rutas de API con autenticación
3. Limita el acceso a las sesiones
4. Haz backups regulares de la base de datos

---

## 🚀 Próximos Pasos

### Respuestas Automáticas con IA

Ahora que WhatsApp está conectado, puedes:

1. **Integrar OpenAI/Claude**
   - Responder automáticamente con IA
   - Usar el contexto de productos
   - Personalizar respuestas

2. **Automatizar Flujos**
   - Responder preguntas frecuentes
   - Enviar catálogos
   - Procesar pedidos

3. **Analíticas**
   - Rastrear conversaciones
   - Medir tiempos de respuesta
   - Generar reportes

---

## 📊 Logs y Debugging

### Ver logs en consola

Los logs aparecen con el prefijo `[Baileys]`:

```
[Baileys] Inicializando conexión para usuario: abc123
[Baileys] QR generado para usuario: abc123
[Baileys] ✅ Conexión establecida para usuario: abc123
[Baileys] Mensaje recibido de 573001234567@s.whatsapp.net: Hola!
```

### Verificar estado de sesión

```javascript
const session = BaileysService.getConnectionStatus(userId)
console.log(session)
```

---

## 🎉 ¡Listo!

Tu sistema de WhatsApp está completamente funcional con:
- ✅ QR real de WhatsApp
- ✅ Conexión persistente
- ✅ Recepción de mensajes
- ✅ Envío de mensajes
- ✅ Gestión de sesiones

**Ahora puedes avanzar con las respuestas automáticas y la integración de IA.**

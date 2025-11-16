# 🚀 WhatsApp Web Estable - Inicio Rápido

## Situación
Meta bloqueó tu WhatsApp. Ahora usaremos **WhatsApp Web** (Baileys) de forma profesional y estable.

## ¿Por qué WhatsApp Web?
✅ Gratuito (sin costos de API)
✅ Rápido (respuestas instantáneas)
✅ Confiable (conexión directa)
✅ Flexible (control total)
✅ Escalable (múltiples instancias)

## Paso 1: Actualizar Variables de Entorno

Abre `.env` y verifica/actualiza:

```env
# WhatsApp Web - Configuración Estable
WHATSAPP_PROVIDER=baileys

# Reconexión Ultra Estable
HEARTBEAT_INTERVAL=15000        # Verificar cada 15s
RECONNECT_ATTEMPTS_MAX=50       # Máximo 50 intentos
RECONNECT_DELAY_BASE=1000       # 1s inicial
RECONNECT_DELAY_MAX=30000       # 30s máximo

# Health Check
ENABLE_CONNECTION_MONITOR=true
CONNECTION_HEALTH_CHECK_INTERVAL=30000
CONNECTION_HEALTH_THRESHOLD=80

# Sesiones
SESSION_PATH=./whatsapp-sessions
SESSION_BACKUP_INTERVAL=300000  # Backup cada 5 min
SESSION_RECOVERY_TIMEOUT=30000

# Puppeteer Optimizado
PUPPETEER_HEADLESS=true
PUPPETEER_SANDBOX=false
PUPPETEER_SHM_USAGE=false
PUPPETEER_GPU=false
```

## Paso 2: Optimizar Baileys

```bash
# Ejecutar script de optimización
npx tsx scripts/optimizar-baileys-reconexion.ts
```

Esto mejora:
- Exponential backoff (1.5x en lugar de 2x)
- Máximo de reintentos (50 en lugar de 5)
- Manejo de conflictos de sesión
- Keep-alive mejorado

## Paso 3: Instalar Dependencias

```bash
npm install
```

## Paso 4: Iniciar el Bot

```bash
npm run dev
```

Verás algo como:
```
[Baileys] 🚀 Inicializando conexión para usuario: user123
[Baileys] 📁 Directorio de sesión: ./auth_sessions/user123
[Baileys] ✅ Estado de autenticación cargado
[Baileys] 📦 Versión de Baileys: 7.0.0-rc.6
[Baileys] ✅ Socket creado
[Baileys] 📱 QR recibido para usuario: user123
```

## Paso 5: Escanear QR

1. Abre el dashboard: http://localhost:4000
2. Ve a "Conexión WhatsApp"
3. Escanea el QR con tu teléfono
4. Confirma en WhatsApp

Verás:
```
[Baileys] ✅ Conexión establecida para usuario: user123
[Baileys] 📱 Número de WhatsApp: 573005560186
[Baileys] ✅ Conexión registrada en base de datos
[Baileys] 💓 Keep-alive iniciado
```

## Paso 6: Verificar Salud de Conexión

```bash
# En otra terminal
curl http://localhost:4000/api/whatsapp/health?userId=user123
```

Respuesta esperada:
```json
{
  "userId": "user123",
  "status": "CONNECTED",
  "isHealthy": true,
  "statusMessage": "✅ Saludable",
  "metrics": {
    "uptime": 3600000,
    "reconnectAttempts": 0,
    "averageResponseTime": 245,
    "messagesSent": 15,
    "messagesReceived": 8,
    "errorRate": "0.00%"
  }
}
```

## Paso 7: Monitorear en Dashboard

1. Ve a http://localhost:4000/dashboard
2. Busca el componente "Estado de WhatsApp"
3. Verás:
   - Estado actual (✅ Saludable / ⚠️ Degradado / ❌ Desconectado)
   - Tiempo de respuesta
   - Tasa de error
   - Mensajes enviados/recibidos
   - Uptime
   - Botón de reconexión manual

## Comportamiento Esperado

### Conexión Normal
```
[Baileys] ✅ Conexión establecida
[Baileys] 💓 Keep-alive: Verificando conexión
[Baileys] 📨 Mensaje procesado de 573001234567
[Baileys] 📤 Respuesta enviada
```

### Desconexión y Reconexión Automática
```
[Baileys] 🔌 Conexión cerrada. Código: 1000
[Baileys] 🔄 Intento de reconexión #1
[Baileys] ⏳ Esperando 1000ms antes de reconectar...
[Baileys] 🔄 Reconectando...
[Baileys] ✅ Conexión establecida
```

### Conflicto de Sesión (440)
```
[Baileys] ⚠️ Conflicto de sesión detectado (440)
[Baileys] 🔓 Limpiando sesión...
[Baileys] ⏳ Esperando 5 segundos...
[Baileys] 🔄 Reconectando...
```

## Troubleshooting

### Problema: "QR no aparece"
```bash
# Limpiar sesión anterior
rm -rf ./auth_sessions/user123

# Reiniciar bot
npm run dev
```

### Problema: "Desconexión frecuente"
```bash
# Aumentar heartbeat
HEARTBEAT_INTERVAL=20000 npm run dev

# Verificar conexión a internet
ping google.com
```

### Problema: "Mensajes no se envían"
```bash
# Verificar estado
curl http://localhost:4000/api/whatsapp/health?userId=user123

# Si está desconectado, reconectar manualmente desde dashboard
```

### Problema: "Bloqueo de Meta"
```
Meta puede bloquear si:
- Envías demasiados mensajes rápido
- Usas patrones detectables
- Cambias de dispositivo frecuentemente

Solución:
- Espaciar mensajes 1-2 segundos
- Usar conversación natural
- Mantener sesión activa
- No cambiar de dispositivo
```

## Mejores Prácticas

### 1. Comportamiento Natural
```typescript
// ✅ BIEN: Espaciar mensajes
await socket.sendMessage(from, { text: 'Hola!' })
await new Promise(r => setTimeout(r, 1000))
await socket.sendMessage(from, { text: 'Cómo estás?' })

// ❌ MAL: Enviar demasiado rápido
await socket.sendMessage(from, { text: 'Hola!' })
await socket.sendMessage(from, { text: 'Cómo estás?' })
```

### 2. Mantener Sesión Activa
```typescript
// El keep-alive se ejecuta automáticamente cada 15s
// No necesitas hacer nada, solo dejar el bot corriendo
```

### 3. Monitorear Regularmente
```bash
# Ver estado cada minuto
watch -n 60 'curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq'
```

### 4. Hacer Backup de Sesión
```bash
# Backup automático cada 5 minutos
# Ubicación: ./auth_sessions/user123/

# Backup manual
cp -r ./auth_sessions/user123 ./auth_sessions/user123.backup
```

## Comandos Útiles

```bash
# Iniciar bot
npm run dev

# Probar conexión
curl http://localhost:4000/api/whatsapp/health?userId=user123

# Ver logs
npm run dev 2>&1 | grep Baileys

# Limpiar sesión
rm -rf ./auth_sessions/user123

# Backup de sesión
cp -r ./auth_sessions/user123 ./auth_sessions/user123.backup

# Restaurar sesión
cp -r ./auth_sessions/user123.backup ./auth_sessions/user123
```

## Monitoreo 24/7

### Opción 1: PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar bot con PM2
pm2 start npm --name "whatsapp-bot" -- run dev

# Ver logs
pm2 logs whatsapp-bot

# Monitorear
pm2 monit
```

### Opción 2: Systemd (Linux)
```bash
# Crear servicio
sudo nano /etc/systemd/system/whatsapp-bot.service

# Contenido:
[Unit]
Description=WhatsApp Bot
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/al/bot
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target

# Habilitar
sudo systemctl enable whatsapp-bot
sudo systemctl start whatsapp-bot
```

### Opción 3: Docker
```bash
# Crear Dockerfile
docker build -t whatsapp-bot .

# Ejecutar
docker run -d \
  --name whatsapp-bot \
  -v $(pwd)/auth_sessions:/app/auth_sessions \
  -p 4000:4000 \
  whatsapp-bot
```

## Próximos Pasos

1. ✅ Actualizar `.env`
2. ✅ Ejecutar script de optimización
3. ✅ Iniciar bot
4. ✅ Escanear QR
5. ✅ Verificar salud
6. ✅ Monitorear 24/7
7. ✅ Ajustar según resultados

## Soporte

Si tienes problemas:

1. Revisa los logs: `npm run dev 2>&1 | grep -i error`
2. Verifica salud: `curl http://localhost:4000/api/whatsapp/health?userId=user123`
3. Limpia sesión: `rm -rf ./auth_sessions/user123`
4. Reinicia bot: `npm run dev`

## Documentación Completa

Para más detalles, ver: `MIGRACION_WHATSAPP_WEB_ESTABLE.md`

---

**Estado**: 🟢 Listo para Producción
**Última Actualización**: 2025-11-15
**Versión**: 1.0

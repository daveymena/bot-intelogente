# 🎯 Comandos Útiles - WhatsApp Web Estable

## Inicio y Control

### Iniciar Bot
```bash
# Desarrollo
npm run dev

# Producción
npm start

# Con PM2
pm2 start npm --name "whatsapp-bot" -- run dev
```

### Detener Bot
```bash
# Ctrl+C en terminal

# Con PM2
pm2 stop whatsapp-bot
pm2 delete whatsapp-bot
```

### Reiniciar Bot
```bash
# Desarrollo
npm run dev

# Con PM2
pm2 restart whatsapp-bot
```

## Monitoreo

### Ver Estado de Conexión
```bash
# Estado actual
curl http://localhost:4000/api/whatsapp/health?userId=user123

# Con formato bonito
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq

# Monitoreo continuo (cada 10s)
watch -n 10 'curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq'
```

### Ver Logs
```bash
# Todos los logs
npm run dev 2>&1

# Solo logs de Baileys
npm run dev 2>&1 | grep Baileys

# Solo errores
npm run dev 2>&1 | grep -i error

# Con timestamp
npm run dev 2>&1 | grep Baileys | sed 's/^/[$(date "+%H:%M:%S")] /'

# Con PM2
pm2 logs whatsapp-bot
pm2 logs whatsapp-bot --lines 100
```

### Ver Métricas
```bash
# Métricas en tiempo real
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq '.metrics'

# Uptime
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq '.metrics.uptime'

# Tasa de error
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq '.metrics.errorRate'

# Tiempo de respuesta
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq '.metrics.averageResponseTime'
```

## Gestión de Sesiones

### Limpiar Sesión
```bash
# Limpiar sesión específica
rm -rf ./auth_sessions/user123

# Limpiar todas las sesiones
rm -rf ./auth_sessions/*

# Limpiar y reiniciar
rm -rf ./auth_sessions/user123 && npm run dev
```

### Backup de Sesión
```bash
# Backup manual
cp -r ./auth_sessions/user123 ./auth_sessions/user123.backup

# Backup con timestamp
cp -r ./auth_sessions/user123 ./auth_sessions/user123.backup.$(date +%Y%m%d_%H%M%S)

# Backup de todas las sesiones
tar -czf auth_sessions_backup.tar.gz ./auth_sessions/
```

### Restaurar Sesión
```bash
# Restaurar desde backup
cp -r ./auth_sessions/user123.backup ./auth_sessions/user123

# Restaurar desde archivo comprimido
tar -xzf auth_sessions_backup.tar.gz
```

### Ver Sesiones
```bash
# Listar sesiones
ls -la ./auth_sessions/

# Ver tamaño de sesiones
du -sh ./auth_sessions/*

# Ver archivos de sesión
ls -la ./auth_sessions/user123/
```

## Reconexión

### Reconectar Manualmente
```bash
# Desde dashboard
# 1. Ir a http://localhost:4000
# 2. Buscar "Estado de WhatsApp"
# 3. Hacer clic en "Reconectar WhatsApp"

# Desde API
curl -X POST http://localhost:4000/api/whatsapp/reconnect?userId=user123

# Desde terminal (limpiar y reiniciar)
rm -rf ./auth_sessions/user123 && npm run dev
```

### Forzar Reconexión
```bash
# Detener bot
pm2 stop whatsapp-bot

# Limpiar sesión
rm -rf ./auth_sessions/user123

# Reiniciar
pm2 start whatsapp-bot

# Ver logs
pm2 logs whatsapp-bot
```

## Optimización

### Ejecutar Script de Optimización
```bash
# Optimizar Baileys
npx tsx scripts/optimizar-baileys-reconexion.ts

# Reiniciar bot
npm run dev
```

### Ajustar Variables de Entorno
```bash
# Aumentar heartbeat (para conexiones lentas)
HEARTBEAT_INTERVAL=20000 npm run dev

# Aumentar timeout (para conexiones muy lentas)
CONNECTION_HEALTH_CHECK_INTERVAL=60000 npm run dev

# Aumentar reintentos (para conexiones inestables)
RECONNECT_ATTEMPTS_MAX=100 npm run dev
```

## Testing

### Probar Conexión
```bash
# Verificar que el bot está corriendo
curl http://localhost:4000/api/whatsapp/health?userId=user123

# Enviar mensaje de prueba
curl -X POST http://localhost:4000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "to": "573001234567",
    "message": "Hola, esto es una prueba"
  }'

# Verificar que se reciben mensajes
# Envía un mensaje a tu número desde WhatsApp
# Verifica en los logs que se procesa
```

### Probar Health Check
```bash
# Health check básico
curl http://localhost:4000/api/whatsapp/health?userId=user123

# Health check con formato
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq '.'

# Health check con filtro
curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq '.status'
```

## Debugging

### Ver Errores Específicos
```bash
# Errores de conexión
npm run dev 2>&1 | grep -i "connection\|disconnect\|error"

# Errores de Baileys
npm run dev 2>&1 | grep -i "baileys"

# Errores de QR
npm run dev 2>&1 | grep -i "qr"

# Errores de reconexión
npm run dev 2>&1 | grep -i "reconnect"
```

### Ver Eventos de Conexión
```bash
# Todos los eventos
npm run dev 2>&1 | grep "\[Baileys\]"

# Eventos de conexión
npm run dev 2>&1 | grep "connection"

# Eventos de desconexión
npm run dev 2>&1 | grep "disconnect"

# Eventos de reconexión
npm run dev 2>&1 | grep "reconnect"
```

### Verificar Puertos
```bash
# Ver si puerto 4000 está en uso
lsof -i :4000

# Ver todos los puertos en uso
netstat -tuln | grep LISTEN

# Matar proceso en puerto 4000
kill -9 $(lsof -t -i :4000)
```

## Mantenimiento

### Limpiar Archivos Temporales
```bash
# Limpiar archivos de audio temporal
rm -rf ./temp-audio/*

# Limpiar caché de Puppeteer
rm -rf ~/.cache/puppeteer

# Limpiar node_modules (si hay problemas)
rm -rf node_modules package-lock.json
npm install
```

### Actualizar Dependencias
```bash
# Ver actualizaciones disponibles
npm outdated

# Actualizar Baileys
npm install @whiskeysockets/baileys@latest

# Actualizar todas las dependencias
npm update
```

### Hacer Backup Completo
```bash
# Backup de sesiones
tar -czf backup_sessions_$(date +%Y%m%d_%H%M%S).tar.gz ./auth_sessions/

# Backup de base de datos
npm run db:backup

# Backup de todo
tar -czf backup_completo_$(date +%Y%m%d_%H%M%S).tar.gz \
  ./auth_sessions/ \
  ./data/ \
  .env \
  package.json
```

## Monitoreo Avanzado

### Monitoreo Continuo con PM2
```bash
# Ver estado en tiempo real
pm2 monit

# Ver logs en tiempo real
pm2 logs whatsapp-bot --lines 50 --follow

# Ver estadísticas
pm2 show whatsapp-bot
```

### Monitoreo con Watch
```bash
# Monitorear estado cada 5 segundos
watch -n 5 'curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq ".status"'

# Monitorear métricas cada 10 segundos
watch -n 10 'curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq ".metrics"'

# Monitorear logs en tiempo real
tail -f /var/log/whatsapp-bot.log
```

### Alertas Automáticas
```bash
# Alertar si desconectado
while true; do
  STATUS=$(curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq -r '.status')
  if [ "$STATUS" != "CONNECTED" ]; then
    echo "⚠️ ALERTA: WhatsApp desconectado!"
    # Enviar notificación (email, Slack, etc.)
  fi
  sleep 60
done
```

## Troubleshooting Rápido

### Bot no inicia
```bash
# Verificar puerto
lsof -i :4000

# Matar proceso anterior
kill -9 $(lsof -t -i :4000)

# Reiniciar
npm run dev
```

### QR no aparece
```bash
# Limpiar sesión
rm -rf ./auth_sessions/user123

# Reiniciar
npm run dev

# Verificar logs
npm run dev 2>&1 | grep QR
```

### Desconexión frecuente
```bash
# Aumentar heartbeat
HEARTBEAT_INTERVAL=20000 npm run dev

# Ver logs de desconexión
npm run dev 2>&1 | grep -i disconnect

# Verificar conexión a internet
ping google.com
```

### Mensajes no se envían
```bash
# Verificar estado
curl http://localhost:4000/api/whatsapp/health?userId=user123

# Ver logs de envío
npm run dev 2>&1 | grep "sendMessage"

# Reconectar
rm -rf ./auth_sessions/user123 && npm run dev
```

## Atajos Útiles

### Crear Alias
```bash
# En ~/.bashrc o ~/.zshrc
alias whatsapp-status='curl -s http://localhost:4000/api/whatsapp/health?userId=user123 | jq'
alias whatsapp-logs='npm run dev 2>&1 | grep Baileys'
alias whatsapp-clean='rm -rf ./auth_sessions/user123'
alias whatsapp-restart='npm run dev'

# Recargar
source ~/.bashrc
```

### Script de Monitoreo
```bash
#!/bin/bash
# Guardar como: monitor-whatsapp.sh

while true; do
  clear
  echo "=== WhatsApp Bot Monitor ==="
  echo "Hora: $(date)"
  echo ""
  
  STATUS=$(curl -s http://localhost:4000/api/whatsapp/health?userId=user123)
  echo "Estado: $(echo $STATUS | jq -r '.status')"
  echo "Saludable: $(echo $STATUS | jq -r '.isHealthy')"
  echo "Uptime: $(echo $STATUS | jq -r '.metrics.uptime')"
  echo "Tiempo de respuesta: $(echo $STATUS | jq -r '.metrics.averageResponseTime')ms"
  echo "Tasa de error: $(echo $STATUS | jq -r '.metrics.errorRate')"
  echo ""
  echo "Presiona Ctrl+C para salir"
  
  sleep 10
done
```

Ejecutar:
```bash
chmod +x monitor-whatsapp.sh
./monitor-whatsapp.sh
```

---

**Última Actualización**: 2025-11-15
**Versión**: 1.0

# ✅ Checklist de Implementación - WhatsApp Web Estable

## 📋 Fase 1: Preparación (30 minutos)

### Configuración
- [ ] Leer `WHATSAPP_WEB_ESTABLE_INICIO_RAPIDO.md`
- [ ] Abrir archivo `.env`
- [ ] Copiar configuración recomendada
- [ ] Guardar cambios

### Verificación
- [ ] Verificar que Node.js está instalado: `node --version`
- [ ] Verificar que npm está instalado: `npm --version`
- [ ] Verificar que puerto 4000 está disponible: `lsof -i :4000`
- [ ] Verificar conexión a internet

## 📋 Fase 2: Optimización (15 minutos)

### Script de Optimización
- [ ] Ejecutar: `npx tsx scripts/optimizar-baileys-reconexion.ts`
- [ ] Verificar que no hay errores
- [ ] Revisar cambios en `src/lib/baileys-stable-service.ts`

### Dependencias
- [ ] Ejecutar: `npm install`
- [ ] Esperar a que termine
- [ ] Verificar que no hay errores

## 📋 Fase 3: Inicio (15 minutos)

### Iniciar Bot
- [ ] Ejecutar: `npm run dev`
- [ ] Esperar a que inicie
- [ ] Verificar que no hay errores

### Escanear QR
- [ ] Abrir: http://localhost:4000
- [ ] Ir a "Conexión WhatsApp"
- [ ] Escanear QR con tu teléfono
- [ ] Confirmar en WhatsApp
- [ ] Esperar a que se conecte

### Verificación de Conexión
- [ ] Ver en logs: `✅ Conexión establecida`
- [ ] Ver en logs: `💓 Keep-alive iniciado`
- [ ] Ver en dashboard: Estado "✅ Saludable"

## 📋 Fase 4: Testing (30 minutos)

### Verificar Salud
- [ ] Ejecutar: `curl http://localhost:4000/api/whatsapp/health?userId=user123`
- [ ] Verificar que status es "CONNECTED"
- [ ] Verificar que isHealthy es true
- [ ] Revisar métricas

### Enviar Mensaje
- [ ] Enviar mensaje desde tu teléfono al bot
- [ ] Verificar que se recibe en logs
- [ ] Verificar que se procesa correctamente
- [ ] Verificar que se responde

### Recibir Mensaje
- [ ] Enviar mensaje desde el bot
- [ ] Verificar que se recibe en tu teléfono
- [ ] Verificar que no hay errores

### Monitoreo
- [ ] Abrir dashboard: http://localhost:4000/dashboard
- [ ] Buscar "Estado de WhatsApp"
- [ ] Verificar que muestra estado en tiempo real
- [ ] Verificar que muestra métricas
- [ ] Verificar que hay botón de reconexión

## 📋 Fase 5: Monitoreo 24/7 (1 semana)

### Día 1
- [ ] Monitorear logs cada hora
- [ ] Verificar estado cada hora: `curl http://localhost:4000/api/whatsapp/health?userId=user123`
- [ ] Revisar dashboard cada hora
- [ ] Documentar cualquier problema

### Día 2-3
- [ ] Monitorear logs cada 4 horas
- [ ] Verificar estado cada 4 horas
- [ ] Revisar dashboard cada 4 horas
- [ ] Documentar cualquier problema

### Día 4-7
- [ ] Monitorear logs diariamente
- [ ] Verificar estado diariamente
- [ ] Revisar dashboard diariamente
- [ ] Documentar cualquier problema

### Métricas a Revisar
- [ ] Uptime (debe ser > 99%)
- [ ] Tiempo de respuesta (debe ser < 500ms)
- [ ] Tasa de error (debe ser < 1%)
- [ ] Reconexiones (debe ser 0 o muy pocas)
- [ ] Mensajes enviados (debe incrementar)
- [ ] Mensajes recibidos (debe incrementar)

## 📋 Fase 6: Ajustes (Según Resultados)

### Si Todo Está Bien
- [ ] Documentar configuración final
- [ ] Crear backup de sesión
- [ ] Entrenar al equipo
- [ ] Pasar a producción

### Si Hay Desconexiones Frecuentes
- [ ] Aumentar `HEARTBEAT_INTERVAL` a 20000
- [ ] Aumentar `CONNECTION_HEALTH_CHECK_INTERVAL` a 60000
- [ ] Revisar conexión a internet
- [ ] Revisar logs de error
- [ ] Reintentar

### Si Hay Bloqueos de Meta
- [ ] Espaciar mensajes más (2-3 segundos)
- [ ] Usar conversación más natural
- [ ] Reducir volumen de mensajes
- [ ] Contactar a Meta si es legítimo

### Si Hay Problemas de Rendimiento
- [ ] Revisar logs de error
- [ ] Verificar recursos del servidor
- [ ] Aumentar timeout
- [ ] Optimizar código

## 📋 Fase 7: Producción (Opcional)

### Configurar PM2
- [ ] Instalar PM2: `npm install -g pm2`
- [ ] Iniciar con PM2: `pm2 start npm --name "whatsapp-bot" -- run dev`
- [ ] Configurar auto-restart: `pm2 startup`
- [ ] Guardar configuración: `pm2 save`

### Configurar Monitoreo
- [ ] Crear script de monitoreo
- [ ] Configurar alertas
- [ ] Configurar logs
- [ ] Configurar backup automático

### Documentación
- [ ] Documentar procedimientos
- [ ] Documentar troubleshooting
- [ ] Documentar comandos útiles
- [ ] Entrenar al equipo

## 🎯 Comandos Rápidos

### Iniciar
```bash
npm run dev
```

### Verificar Salud
```bash
curl http://localhost:4000/api/whatsapp/health?userId=user123
```

### Ver Logs
```bash
npm run dev 2>&1 | grep Baileys
```

### Limpiar Sesión
```bash
rm -rf ./auth_sessions/user123
```

### Reconectar
```bash
rm -rf ./auth_sessions/user123 && npm run dev
```

## 🚨 Problemas Comunes

### QR no aparece
```bash
rm -rf ./auth_sessions/user123
npm run dev
```

### Desconexión frecuente
```bash
HEARTBEAT_INTERVAL=20000 npm run dev
```

### Mensajes no se envían
```bash
curl http://localhost:4000/api/whatsapp/health?userId=user123
```

### Bot no inicia
```bash
kill -9 $(lsof -t -i :4000)
npm run dev
```

## 📊 Métricas Esperadas

### Conexión Normal
```
✅ Status: CONNECTED
✅ IsHealthy: true
✅ Uptime: > 1 hora
✅ Avg Response Time: 200-300ms
✅ Error Rate: 0-2%
```

### Después de 1 Semana
```
✅ Uptime: > 99%
✅ Reconexiones: 0-2
✅ Mensajes Enviados: > 100
✅ Mensajes Recibidos: > 50
✅ Error Rate: < 1%
```

## 📝 Notas

### Configuración Actual
```
HEARTBEAT_INTERVAL=15000
RECONNECT_ATTEMPTS_MAX=50
RECONNECT_DELAY_BASE=1000
RECONNECT_DELAY_MAX=30000
ENABLE_CONNECTION_MONITOR=true
CONNECTION_HEALTH_CHECK_INTERVAL=30000
CONNECTION_HEALTH_THRESHOLD=80
```

### Archivos Importantes
- `.env` - Variables de entorno
- `src/lib/baileys-stable-service.ts` - Servicio de Baileys
- `src/lib/whatsapp-health-monitor.ts` - Monitor de salud
- `src/components/WhatsAppHealthMonitor.tsx` - Componente UI
- `./auth_sessions/` - Sesiones de WhatsApp

### Documentación
- `WHATSAPP_WEB_ESTABLE_INICIO_RAPIDO.md` - Inicio rápido
- `MIGRACION_WHATSAPP_WEB_ESTABLE.md` - Plan completo
- `COMANDOS_WHATSAPP_WEB_ESTABLE.md` - Referencia de comandos
- `RESUMEN_MIGRACION_WHATSAPP_WEB.md` - Resumen ejecutivo

## ✅ Firma de Implementación

Cuando hayas completado todo, marca aquí:

- [ ] Fase 1: Preparación ✅
- [ ] Fase 2: Optimización ✅
- [ ] Fase 3: Inicio ✅
- [ ] Fase 4: Testing ✅
- [ ] Fase 5: Monitoreo 24/7 ✅
- [ ] Fase 6: Ajustes ✅
- [ ] Fase 7: Producción ✅

**Fecha de Implementación**: _______________
**Responsable**: _______________
**Notas**: _______________

---

**Estado**: 🟢 Listo para Implementar
**Versión**: 1.0
**Última Actualización**: 2025-11-15

# 💓 Sistema Keep-Alive Implementado

## 🎯 Problema Resuelto

En servidores VPS y plataformas como EasyPanel, las conexiones WebSocket de WhatsApp pueden cerrarse por inactividad después de cierto tiempo, causando desconexiones frecuentes.

## ✅ Solución Implementada

**Sistema de Keep-Alive (Heartbeat)** que envía señales periódicas para mantener la conexión activa.

### 🔧 Cómo Funciona

1. **Cuando se conecta**: Inicia un timer que envía presencia cada 60 segundos
2. **Señal de vida**: Envía `sendPresenceUpdate('available')` periódicamente
3. **Mantiene conexión**: Evita que el servidor cierre la conexión por inactividad
4. **Se detiene automáticamente**: Cuando se desconecta o cierra sesión

### 📊 Implementación

```typescript
// Cada 60 segundos
setInterval(async () => {
  await socket.sendPresenceUpdate('available')
  console.log(`[Baileys] 💓 Keep-alive enviado`)
}, 60 * 1000)
```

## 🔍 Logs del Sistema

### Al Conectar:
```
[Baileys] ✅ Conexión establecida
[Baileys] ✅ Conexión registrada en base de datos
[Baileys] 💓 Iniciando keep-alive para xxx
[Baileys] ✅ Keep-alive configurado (cada 60s)
```

### Durante la Conexión:
```
[Baileys] 💓 Keep-alive enviado para xxx
... (cada 60 segundos)
```

### Al Desconectar:
```
[Baileys] 🚪 Usuario cerró sesión
[Baileys] 💓 Keep-alive detenido para xxx
```

## 📈 Beneficios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Desconexión por inactividad | ❌ Frecuente | ✅ Rara |
| Estabilidad en VPS | ❌ Baja | ✅ Alta |
| Conexión en EasyPanel | ❌ Inestable | ✅ Estable |
| Timeout de WebSocket | ❌ Común | ✅ Evitado |
| Disponibilidad | ❌ Media | ✅ Alta |

## ⚙️ Configuración

### Intervalo de Keep-Alive

Por defecto: 60 segundos

Para cambiar, edita en `src/lib/baileys-stable-service.ts`:

```typescript
}, 60 * 1000) // Cambiar aquí (en milisegundos)
```

**Valores recomendados:**
- **Desarrollo**: 60000 (60 segundos)
- **Producción estable**: 60000 (60 segundos)
- **VPS con timeout corto**: 30000 (30 segundos)
- **Alta disponibilidad**: 45000 (45 segundos)

### Tipo de Presencia

Actualmente envía: `'available'`

Otras opciones:
- `'available'` - Disponible (recomendado)
- `'unavailable'` - No disponible
- `'composing'` - Escribiendo
- `'recording'` - Grabando audio

## 🧪 Cómo Probar

### Prueba 1: Verificar Keep-Alive en Logs

```bash
# 1. Reiniciar servidor
npm run dev

# 2. Conectar WhatsApp
# 3. Observar logs cada 60 segundos
# Debe ver:
# [Baileys] 💓 Keep-alive enviado para xxx
```

### Prueba 2: Conexión Prolongada

```bash
# 1. Conectar WhatsApp
# 2. Dejar conectado por varias horas
# 3. Verificar que NO se desconecte
# ✅ Debe mantenerse conectado
```

### Prueba 3: En Producción (EasyPanel)

```bash
# 1. Desplegar a EasyPanel
# 2. Conectar WhatsApp
# 3. Dejar funcionando 24 horas
# ✅ Debe mantenerse conectado sin intervención
```

## 💡 Mejoras Adicionales Recomendadas

### 1. Verificar Versión de Baileys

```bash
npm list @whiskeysockets/baileys
```

Asegúrate de tener la última versión:

```bash
npm install @whiskeysockets/baileys@latest
```

### 2. Configurar PM2 en Producción

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start npm --name "whatsapp-bot" -- start

# Guardar configuración
pm2 save

# Auto-inicio en reinicio
pm2 startup
```

### 3. Configurar Restart Policy en EasyPanel

En EasyPanel → App Settings:
- **Restart Policy**: Always
- **Health Check**: Enabled
- **Health Check Path**: /api/health

### 4. Monitoreo de Conexión

El sistema de auto-conexión ya verifica cada 30 segundos:
- Detecta desconexiones
- Reconecta automáticamente
- Mantiene alta disponibilidad

## 🚨 Troubleshooting

### Si aún se desconecta:

1. **Reducir intervalo de keep-alive**
   ```typescript
   }, 30 * 1000) // 30 segundos en lugar de 60
   ```

2. **Verificar firewall del VPS**
   - Asegurar que no bloquea WebSockets
   - Permitir conexiones salientes

3. **Verificar logs de EasyPanel**
   - Buscar errores de timeout
   - Verificar límites de recursos

4. **Aumentar timeout del servidor**
   - En nginx: `proxy_read_timeout 300s;`
   - En Apache: `Timeout 300`

## 📝 Archivos Modificados

1. **src/lib/baileys-stable-service.ts**
   - Agregado `keepAliveTimers: Map<string, NodeJS.Timeout>`
   - Agregado método `startKeepAlive()`
   - Agregado método `stopKeepAlive()`
   - Integrado en flujo de conexión/desconexión

## 🎯 Casos de Uso

### Caso 1: Desarrollo Local
```
- Keep-alive cada 60s
- Mantiene conexión estable
- Evita desconexiones por inactividad
```

### Caso 2: Producción en VPS
```
- Keep-alive cada 60s
- Previene timeout del servidor
- Alta disponibilidad 24/7
```

### Caso 3: EasyPanel/Docker
```
- Keep-alive cada 60s
- Evita que el contenedor cierre la conexión
- Funciona con restart policy "Always"
```

## 📊 Estadísticas Esperadas

Con keep-alive activo:
- **Uptime**: >99%
- **Desconexiones por inactividad**: 0
- **Reconexiones necesarias**: Mínimas
- **Disponibilidad**: Alta

## 🔮 Próximas Mejoras

1. **Keep-alive adaptativo**
   - Ajustar intervalo según estabilidad
   - Reducir si hay desconexiones frecuentes

2. **Monitoreo de latencia**
   - Medir tiempo de respuesta
   - Alertar si aumenta

3. **Múltiples estrategias**
   - Combinar presencia + ping
   - Fallback si una falla

---

**Estado**: ✅ Implementado y activo  
**Fecha**: 2025-11-04  
**Impacto**: Alto - Mejora estabilidad en producción  
**Recomendado para**: Todos los despliegues en VPS/EasyPanel

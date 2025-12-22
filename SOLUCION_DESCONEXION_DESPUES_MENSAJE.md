# 🔴 Solución: Desconexión Después de Enviar Mensaje

## 🎯 El Problema Real

El bot **SÍ funciona**:
- ✅ Recibe mensajes
- ✅ Procesa con IA
- ✅ Genera respuesta
- ❌ Se desconecta AL ENVIAR la respuesta

**Error clave:**
```
[Baileys] ❌ Error en respuesta automática: Error: Connection Closed
```

## 🔍 Causas Identificadas

### 1. Usuario Fantasma
```
[API Reconnect] ❌ Error: Foreign key constraint violated
userId: cmhc22zw20000kmhgvx5ubazy
```

Este usuario NO existe pero está intentando reconectar constantemente.

### 2. Múltiples Instancias
```
[Baileys] ⚠️ Conflicto detectado: otra sesión está activa
```

Hay múltiples procesos intentando conectar el mismo número.

### 3. Conexión se Cierra al Enviar
WhatsApp cierra la conexión después de enviar mensajes, probablemente por:
- Demasiadas reconexiones
- Sesión inestable
- Conflictos de sesión

## ✅ Solución Paso a Paso

### Paso 1: Limpiar Usuario Fantasma

En Easypanel → PostgreSQL → Query:

```sql
-- Ver usuarios fantasma
SELECT * FROM whatsapp_connections 
WHERE userId NOT IN (SELECT id FROM users);

-- Eliminar conexiones huérfanas
DELETE FROM whatsapp_connections 
WHERE userId NOT IN (SELECT id FROM users);

-- Verificar
SELECT COUNT(*) FROM whatsapp_connections;
```

### Paso 2: Limpiar TODAS las Sesiones

En Easypanel Terminal:

```bash
# Eliminar archivos de sesión
rm -rf auth_sessions/*

# Limpiar base de datos
npx prisma studio
# O ejecutar query:
# DELETE FROM whatsapp_connections;
```

### Paso 3: Reiniciar Servicio Completamente

En Easypanel:
1. **Stop** el servicio
2. Espera 30 segundos
3. **Start** el servicio
4. Espera que arranque completamente

### Paso 4: Conectar UNA SOLA VEZ

1. Abre el Dashboard
2. Ve a WhatsApp
3. **Desconecta** si muestra conectado
4. **Conecta** de nuevo
5. **Escanea el QR INMEDIATAMENTE**
6. Espera ver: `✅ Bot listo para enviar mensajes`

### Paso 5: NO Abrir Múltiples Pestañas

**IMPORTANTE:**
- ❌ NO abras el Dashboard en múltiples pestañas
- ❌ NO abras en múltiples navegadores
- ❌ NO uses modo incógnito y normal simultáneamente
- ✅ USA SOLO UNA pestaña del Dashboard

### Paso 6: Verificar Funcionamiento

1. **Cierra el navegador** completamente
2. **Envía mensaje** al bot desde otro teléfono
3. **¿Responde sin desconectarse?**

## 🔧 Script de Limpieza Automática

Crea este script para limpiar todo:

```bash
#!/bin/bash
# scripts/limpiar-sesiones-completo.sh

echo "🧹 Limpiando sesiones de WhatsApp..."

# 1. Eliminar archivos de sesión
rm -rf auth_sessions/*
echo "✅ Archivos de sesión eliminados"

# 2. Limpiar base de datos
npx prisma db execute --stdin <<SQL
DELETE FROM whatsapp_connections WHERE userId NOT IN (SELECT id FROM users);
DELETE FROM whatsapp_connections WHERE status = 'DISCONNECTED';
SQL
echo "✅ Base de datos limpiada"

# 3. Reiniciar servicio
echo "🔄 Reinicia el servicio manualmente en Easypanel"
echo "✅ Listo para reconectar WhatsApp"
```

## 🎯 Configuración Correcta

### En `src/lib/baileys-service.ts`

Asegúrate de que solo haya UNA instancia por usuario:

```typescript
// Verificar si ya existe una instancia
if (BaileysService.instances.has(userId)) {
  console.log('[Baileys] ⚠️ Instancia ya existe, reutilizando')
  return BaileysService.instances.get(userId)!
}
```

### Evitar Reconexiones Múltiples

```typescript
// NO reconectar si ya hay una conexión activa
if (this.isConnecting) {
  console.log('[Baileys] ⚠️ Ya hay una conexión en proceso')
  return
}
```

## 📊 Verificación de Estado

### Comando para ver estado actual:

```bash
# En Easypanel Terminal
npx tsx -e "
import { db } from './src/lib/db';
const connections = await db.whatsAppConnection.findMany();
console.log('Conexiones activas:', connections.length);
connections.forEach(c => {
  console.log(\`- Usuario: \${c.userId}\`);
  console.log(\`  Estado: \${c.status}\`);
  console.log(\`  Conectado: \${c.isConnected}\`);
});
"
```

## 🚨 Si Sigue Desconectándose

### Opción A: Aumentar Timeout

En `src/lib/baileys-service.ts`:

```typescript
const sock = makeWASocket({
  // ... otras opciones
  connectTimeoutMs: 60000, // 60 segundos
  qrTimeout: 60000,
  retryRequestDelayMs: 1000,
})
```

### Opción B: Deshabilitar Auto-Reconexión Agresiva

```typescript
// Solo reconectar si es necesario
if (reason === DisconnectReason.loggedOut) {
  // NO reconectar automáticamente
  console.log('[Baileys] Sesión cerrada, requiere nuevo QR')
  return
}
```

### Opción C: Usar Keep-Alive

```typescript
// Mantener conexión activa
setInterval(() => {
  if (sock && sock.user) {
    sock.sendPresenceUpdate('available')
  }
}, 30000) // Cada 30 segundos
```

## 🎯 Checklist Final

Marca cada punto:

- [ ] Usuario fantasma eliminado de BD
- [ ] Archivos de sesión limpiados
- [ ] Servicio reiniciado completamente
- [ ] Solo UNA pestaña del Dashboard abierta
- [ ] WhatsApp conectado correctamente
- [ ] Bot responde sin desconectarse
- [ ] Conexión estable por 10+ minutos
- [ ] Múltiples mensajes sin desconexión

## 💡 Prevención

Para evitar que vuelva a pasar:

### 1. Monitoreo de Conexión

```typescript
// Alertar si hay múltiples intentos
if (reconnectAttempts > 3) {
  console.error('[Baileys] ⚠️ Demasiados intentos de reconexión')
  // Enviar email de alerta
  // Detener reconexiones automáticas
}
```

### 2. Limpieza Automática

```typescript
// Limpiar sesiones antiguas cada hora
setInterval(async () => {
  await db.whatsAppConnection.deleteMany({
    where: {
      updatedAt: {
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      status: 'DISCONNECTED'
    }
  })
}, 60 * 60 * 1000)
```

### 3. Límite de Instancias

```typescript
// Solo permitir UNA instancia por usuario
const MAX_INSTANCES_PER_USER = 1

if (activeInstances >= MAX_INSTANCES_PER_USER) {
  throw new Error('Ya hay una instancia activa')
}
```

## 📞 Resumen

**El problema NO es que el bot no funcione**, sino que:
1. Hay un usuario fantasma causando errores
2. Múltiples instancias compiten por la conexión
3. La conexión se cierra al enviar mensajes

**Solución:**
1. Limpia TODO (BD + archivos)
2. Reinicia el servicio
3. Conecta UNA SOLA VEZ
4. USA SOLO UNA pestaña

Después de esto, el bot debería funcionar perfectamente 24/7.

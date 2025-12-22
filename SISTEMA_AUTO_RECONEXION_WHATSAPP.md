# 🔄 SISTEMA DE AUTO-RECONEXIÓN DE WHATSAPP

## 🎯 Objetivo

Conectar automáticamente WhatsApp cuando el servidor inicia y mantener la conexión activa sin intervención manual.

---

## ✨ Características

### 1. Conexión Automática al Iniciar
- ✅ Se conecta automáticamente 5 segundos después de que el servidor inicia
- ✅ No requiere ir al dashboard para conectar
- ✅ Busca el primer usuario ADMIN y lo conecta

### 2. Verificación Periódica
- ✅ Verifica el estado cada 30 segundos
- ✅ Detecta desconexiones automáticamente
- ✅ Reconecta si detecta que está desconectado

### 3. Reconexión Inteligente
- ✅ Máximo 5 intentos de reconexión
- ✅ Si falla 5 veces, espera 5 minutos antes de reintentar
- ✅ Resetea el contador cuando hay conexión exitosa

### 4. Multi-Usuario
- ✅ Soporta múltiples usuarios
- ✅ Verifica y reconecta cada usuario individualmente
- ✅ Logs claros por cada usuario

---

## 🚀 Cómo Funciona

### Flujo de Inicio

```
1. Servidor inicia
   ↓
2. Espera 5 segundos (para que todo esté listo)
   ↓
3. Busca usuario ADMIN en la base de datos
   ↓
4. Verifica si ya está conectado
   ↓
5. Si NO está conectado → Conecta automáticamente
   ↓
6. Inicia verificación periódica cada 30 segundos
```

### Flujo de Verificación Periódica

```
Cada 30 segundos:
   ↓
1. Obtener todos los usuarios activos
   ↓
2. Para cada usuario:
   ├─ ¿Está conectado?
   │  ├─ SÍ → Log: "✅ Usuario conectado"
   │  └─ NO → Intentar reconectar
   ↓
3. Si reconexión exitosa → Resetear contador
   ↓
4. Si falla → Incrementar contador
   ↓
5. Si contador >= 5 → Esperar 5 minutos
```

---

## 📝 Logs del Sistema

### Logs de Inicio
```
🚀 [Auto-Reconnect] Iniciando sistema de auto-reconexión...
🔌 [Auto-Reconnect] Intentando conectar WhatsApp...
🔌 [Auto-Reconnect] Conectando admin@example.com...
✅ [Auto-Reconnect] admin@example.com conectado exitosamente
✅ [Auto-Reconnect] Sistema iniciado correctamente
```

### Logs de Verificación
```
✅ [Auto-Reconnect] Usuario admin@example.com conectado
```

### Logs de Reconexión
```
🔄 [Auto-Reconnect] Usuario admin@example.com desconectado, intentando reconectar...
🔌 [Auto-Reconnect] Conectando admin@example.com...
✅ [Auto-Reconnect] admin@example.com conectado exitosamente
```

### Logs de Error
```
❌ [Auto-Reconnect] Error al conectar (intento 1/5): Connection failed
⚠️ [Auto-Reconnect] Máximo de intentos alcanzado, esperando 5 minutos...
```

---

## 🔧 Configuración

### Parámetros Ajustables

En `src/lib/whatsapp-auto-reconnect.ts`:

```typescript
// Tiempo de espera inicial (milisegundos)
await this.sleep(5000) // 5 segundos

// Intervalo de verificación (milisegundos)
setInterval(async () => {
    await this.checkAndReconnect()
}, 30000) // 30 segundos

// Máximo de intentos antes de esperar
private static maxReconnectAttempts = 5

// Tiempo de espera después de fallar (milisegundos)
await this.sleep(300000) // 5 minutos
```

---

## 🎮 Uso Manual

### Forzar Reconexión

Si necesitas forzar una reconexión manualmente:

```typescript
import { WhatsAppAutoReconnect } from './src/lib/whatsapp-auto-reconnect'

// Reconectar usuario específico
await WhatsAppAutoReconnect.forceReconnect('user-id-aqui')

// Reconectar primer usuario ADMIN
await WhatsAppAutoReconnect.forceReconnect()
```

### Detener Sistema

```typescript
import { WhatsAppAutoReconnect } from './src/lib/whatsapp-auto-reconnect'

WhatsAppAutoReconnect.stop()
```

---

## 🔍 Verificación

### Verificar que está funcionando

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Buscar en los logs:**
   ```
   ✅ [Auto-Reconnect] Sistema iniciado correctamente
   ✅ [Auto-Reconnect] admin@example.com conectado exitosamente
   ```

3. **Verificar cada 30 segundos:**
   ```
   ✅ [Auto-Reconnect] Usuario admin@example.com conectado
   ```

---

## 🐛 Troubleshooting

### Problema: No se conecta automáticamente

**Posibles causas:**
1. No hay usuario ADMIN en la base de datos
2. Las credenciales de WhatsApp no están guardadas
3. Error en el servicio de Baileys

**Solución:**
```bash
# Verificar usuarios en BD
npx tsx -e "import { db } from './src/lib/db.js'; db.user.findMany().then(console.log)"

# Ver logs completos
npm run dev | grep "Auto-Reconnect"
```

### Problema: Se desconecta constantemente

**Posibles causas:**
1. Sesión de WhatsApp expirada
2. Problemas de red
3. WhatsApp bloqueó el número

**Solución:**
1. Eliminar sesión antigua: `rm -rf auth_sessions/*`
2. Escanear QR nuevamente desde el dashboard
3. Verificar que el número no esté bloqueado

### Problema: Muchos intentos fallidos

**Comportamiento esperado:**
- Después de 5 intentos fallidos, espera 5 minutos
- Esto evita saturar el servidor con intentos constantes

**Solución:**
- Esperar los 5 minutos
- O reiniciar el servidor para resetear el contador

---

## 📊 Ventajas del Sistema

| Característica | Antes | Ahora |
|----------------|-------|-------|
| Conexión inicial | Manual desde dashboard | ✅ Automática |
| Reconexión | Manual | ✅ Automática |
| Verificación | No existe | ✅ Cada 30 segundos |
| Multi-usuario | No | ✅ Sí |
| Logs | Básicos | ✅ Detallados |
| Reintentos | Infinitos | ✅ Inteligentes (5 max) |

---

## 🚀 Próximas Mejoras

1. **Notificaciones**: Enviar email cuando falla la conexión
2. **Dashboard**: Mostrar estado de auto-reconexión en el dashboard
3. **Configuración**: Permitir ajustar parámetros desde el dashboard
4. **Métricas**: Guardar estadísticas de reconexiones en BD

---

## 📝 Archivos Relacionados

- `src/lib/whatsapp-auto-reconnect.ts` - Sistema de auto-reconexión
- `server.ts` - Inicialización del sistema
- `src/lib/baileys-stable-service.ts` - Servicio de WhatsApp

---

**Fecha de creación:** Noviembre 2024  
**Versión:** 1.0.0  
**Estado:** ✅ Funcionando

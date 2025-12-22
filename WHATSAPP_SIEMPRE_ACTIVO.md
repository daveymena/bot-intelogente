# 🔄 WhatsApp Siempre Activo (24/7)

## 🎯 El Problema

Si tienes que "reactivar" WhatsApp cada vez que abres el Dashboard, significa que la sesión NO se está persistiendo correctamente.

## ✅ Cómo DEBERÍA Funcionar

```
1. Conectas WhatsApp una vez (escaneas QR)
2. Cierras el navegador
3. El bot sigue funcionando 24/7 en el servidor
4. Cuando vuelves a abrir el Dashboard, WhatsApp sigue conectado
5. Los clientes pueden escribir en cualquier momento
```

**NO deberías tener que reconectar cada vez que abres la página.**

## 🔍 Diagnóstico

### Verifica si el bot está realmente activo:

1. **Conecta WhatsApp** en el Dashboard
2. **Cierra el navegador** completamente
3. **Envía un mensaje** al bot desde otro teléfono
4. **¿El bot responde?**

**SI responde:** ✅ El bot funciona, solo el Dashboard no muestra el estado correcto  
**NO responde:** ❌ El bot se está desconectando (problema de sesión)

## 🔧 Solución 1: Verificar Persistencia de Sesión

### En Easypanel:

1. Ve a tu servicio → **Logs**
2. Busca estos mensajes:

```
✅ CORRECTO:
[SessionManager] ✅ Gestor de sesiones inicializado
[Baileys] ✅ Conexión establecida
[Baileys] ✅ Bot listo para enviar mensajes
```

```
❌ PROBLEMA:
[SessionManager] ❌ Error inicializando
[Baileys] Conexión cerrada
[Baileys] Timeout esperando QR
```

## 🔧 Solución 2: Asegurar Persistencia en Base de Datos

El problema común es que la sesión se guarda en memoria pero NO en la base de datos.

### Verificar en la Base de Datos:

```sql
-- Conecta a PostgreSQL en Easypanel
SELECT * FROM whatsapp_connections 
WHERE userId = 'TU_USER_ID';
```

**Debe mostrar:**
- `status`: 'CONNECTED'
- `isConnected`: true
- `sessionId`: (debe tener valor)

**Si está vacío o NULL:** La sesión no se está guardando.

## 🔧 Solución 3: Forzar Reconexión Automática

Tu sistema ya tiene auto-reconexión, pero podemos mejorarla:

### Archivo: `src/lib/session-manager.ts`

El SessionManager debe:
1. ✅ Guardar sesión en DB
2. ✅ Restaurar sesión al reiniciar
3. ✅ Reconectar automáticamente si se pierde
4. ✅ Verificar estado cada 5 minutos

## 🔧 Solución 4: Usar Archivos de Sesión

Baileys guarda las sesiones en archivos. Verifica que existan:

### En Easypanel Terminal:

```bash
ls -la auth_sessions/
```

**Debe mostrar:**
```
creds.json
app-state-sync-key-*.json
app-state-sync-version-*.json
```

**Si NO existen:** Las sesiones no se están guardando en disco.

## 🚀 Solución Definitiva

### Paso 1: Limpiar Sesiones Antiguas

```bash
# En Easypanel Terminal
rm -rf auth_sessions/*
```

### Paso 2: Reiniciar el Servicio

En Easypanel:
1. Ve a tu servicio
2. Clic en "Restart"
3. Espera 30 segundos

### Paso 3: Conectar WhatsApp Correctamente

1. Abre el Dashboard
2. Ve a WhatsApp
3. Clic en "Conectar"
4. **Escanea el QR inmediatamente** (no esperes)
5. Espera a ver: "✅ Bot listo"

### Paso 4: Verificar Persistencia

1. **Cierra el navegador** completamente
2. **Espera 2 minutos**
3. **Envía un mensaje** al bot desde otro teléfono
4. **¿Responde?**

**SI:** ✅ Funciona correctamente  
**NO:** Continúa con Solución 5

## 🔧 Solución 5: Verificar Variables de Entorno

En Easypanel, verifica que tengas:

```env
DATABASE_URL=postgresql://...  # Debe estar configurado
NODE_ENV=production
```

**NO debe tener:**
```env
DATABASE_URL=file:./dev.db  # ❌ SQLite no persiste bien en contenedores
```

## 🔧 Solución 6: Monitoreo Activo

Tu sistema tiene un monitor de conexión. Verifica que esté activo:

### En los logs debe aparecer:

```
[Monitor] 🔍 Iniciando monitoreo de conexión
[Monitor] ✅ Conexión estable
```

**Si aparece:**
```
[Monitor] ⚠️ Conexión perdida, reconectando...
```

Significa que se está desconectando y reconectando constantemente.

## 🎯 Configuración Recomendada

### 1. **Usar PostgreSQL** (no SQLite)
- ✅ Persiste correctamente en contenedores
- ✅ Mejor para producción
- ✅ No se pierde al reiniciar

### 2. **Habilitar Auto-Reconexión**
Ya está habilitado en tu código:
```typescript
[Baileys] ⚠️ Conexión perdida, reconectando...
```

### 3. **Guardar Sesión en Múltiples Lugares**
- ✅ Base de datos (PostgreSQL)
- ✅ Archivos (auth_sessions/)
- ✅ Memoria (para acceso rápido)

## 📊 Checklist de Verificación

Marca cada punto:

- [ ] PostgreSQL configurado (no SQLite)
- [ ] Sesión guardada en DB (`whatsapp_connections`)
- [ ] Archivos de sesión existen (`auth_sessions/`)
- [ ] SessionManager inicializado en logs
- [ ] Monitor de conexión activo
- [ ] Bot responde con navegador cerrado
- [ ] Estado se mantiene al reabrir Dashboard

## 🔴 Problema Común: Socket.IO

Si el Dashboard muestra "Desconectado" pero el bot SÍ funciona:

**Problema:** El Dashboard usa Socket.IO para mostrar el estado en tiempo real. Si Socket.IO se desconecta, el Dashboard muestra "Desconectado" aunque el bot esté funcionando.

**Solución:** Recargar la página (F5)

**Verificación:** Envía un mensaje al bot. Si responde, está funcionando.

## 🎯 Prueba Final

### Test de 24 Horas:

1. **Día 1 - 10:00 AM:**
   - Conecta WhatsApp
   - Envía mensaje de prueba
   - Bot responde ✅
   - Cierra navegador

2. **Día 1 - 6:00 PM:**
   - NO abras el Dashboard
   - Envía mensaje al bot
   - ¿Responde? ✅

3. **Día 2 - 10:00 AM:**
   - Abre el Dashboard
   - ¿Muestra "Conectado"? ✅
   - Envía mensaje
   - ¿Responde? ✅

**Si pasa las 3 pruebas:** ✅ Funciona correctamente 24/7

## 🚨 Si Sigue Sin Funcionar

### Opción A: Revisar Logs Completos

```bash
# En Easypanel Terminal
tail -f /var/log/app.log
```

Busca errores relacionados con:
- `[Baileys]`
- `[SessionManager]`
- `[Monitor]`

### Opción B: Habilitar Logs Detallados

En `.env`:
```env
DEBUG=baileys:*
LOG_LEVEL=debug
```

### Opción C: Contactar Soporte

Si después de todo esto sigue sin funcionar:

1. Copia los logs completos
2. Verifica la configuración de PostgreSQL
3. Revisa que Easypanel no esté reiniciando el contenedor

## 💡 Resumen

**El bot DEBE funcionar 24/7 sin que tengas la página abierta.**

Si no lo hace:
1. ✅ Verifica PostgreSQL (no SQLite)
2. ✅ Limpia sesiones antiguas
3. ✅ Reconecta WhatsApp correctamente
4. ✅ Verifica que responda con navegador cerrado
5. ✅ Revisa logs para errores

**Una vez configurado correctamente, NUNCA deberías tener que reconectar.**

## 📞 Próximos Pasos

1. **Prueba ahora:** Conecta WhatsApp, cierra navegador, envía mensaje
2. **Si funciona:** ✅ Todo bien, solo era confusión del Dashboard
3. **Si NO funciona:** Sigue las soluciones en orden
4. **Reporta:** Qué solución funcionó para documentar

El objetivo es que conectes WhatsApp **UNA VEZ** y funcione **PARA SIEMPRE** (o hasta que desconectes manualmente).

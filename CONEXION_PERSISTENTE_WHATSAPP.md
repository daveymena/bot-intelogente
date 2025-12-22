# 🔄 CONEXIÓN PERSISTENTE DE WHATSAPP

## ✅ Sistema Implementado

Hemos implementado un **Gestor de Sesiones Persistentes** que mantiene WhatsApp conectado en segundo plano de forma automática.

## 🚀 Características

### 1. **Reconexión Automática al Iniciar**
- Cuando inicias el servidor (`npm run dev`), el sistema busca todas las conexiones que estaban activas
- Reconecta automáticamente cada una
- No necesitas volver a escanear el QR

### 2. **Monitoreo Continuo**
- Verifica el estado de la conexión cada 2 minutos
- Si detecta que se perdió la conexión, reconecta automáticamente
- Funciona 24/7 en segundo plano

### 3. **Verificación Periódica**
- Cada 5 minutos verifica todas las sesiones activas
- Asegura que ninguna conexión se pierda
- Logs detallados en consola

### 4. **Persistencia de Sesión**
- Las credenciales se guardan en `auth_sessions/[userId]`
- Aunque reinicies el servidor, la sesión se mantiene
- No necesitas escanear el QR cada vez

## 📋 Cómo Funciona

### Primera Vez (Escanear QR):

```
1. Conectas WhatsApp desde el dashboard
2. Escaneas el QR con tu teléfono
3. La sesión se guarda en disco
4. El bot empieza a recibir mensajes
```

### Reinicios del Servidor:

```
1. Detienes el servidor (Ctrl+C)
2. Vuelves a iniciar (npm run dev)
3. El SessionManager detecta la sesión guardada
4. Reconecta automáticamente
5. ¡El bot sigue funcionando sin escanear QR!
```

### Si Se Pierde la Conexión:

```
1. WhatsApp se desconecta por algún motivo
2. El SessionManager lo detecta (máximo 2 minutos)
3. Intenta reconectar automáticamente
4. Si tiene las credenciales, reconecta sin QR
5. Si no, actualiza el estado a DISCONNECTED
```

## 🔍 Logs del Sistema

Verás estos mensajes en la consola:

```
[SessionManager] 🚀 Inicializando gestor de sesiones...
[SessionManager] Encontradas 1 conexiones activas
[SessionManager] 🔄 Restaurando sesión para usuario: cmhc22zw20000kmhgvx5ubazy
[SessionManager] ✅ Sesión restaurada para: cmhc22zw20000kmhgvx5ubazy
[SessionManager] ⏰ Auto-reconexión configurada para: cmhc22zw20000kmhgvx5ubazy
[SessionManager] ✅ Gestor de sesiones inicializado
```

## 🎯 Ventajas

### ✅ Sin Interrupciones
- El bot funciona 24/7
- No se detiene aunque reinicies el servidor
- Los clientes siempre reciben respuesta

### ✅ Sin Escanear QR Repetidamente
- Solo escaneas el QR la primera vez
- Las siguientes veces reconecta automáticamente
- Credenciales guardadas de forma segura

### ✅ Acceso desde Cualquier Lugar
- Puedes acceder al dashboard desde otro dispositivo
- La conexión se mantiene en el servidor
- No depende de que tengas el navegador abierto

### ✅ Recuperación Automática
- Si WhatsApp se desconecta, reconecta solo
- Monitoreo constante del estado
- Logs detallados para debugging

## 📁 Archivos de Sesión

Las sesiones se guardan en:
```
auth_sessions/
  └── [userId]/
      ├── creds.json
      ├── app-state-sync-key-*.json
      └── pre-key-*.json
```

**IMPORTANTE:** 
- NO borres esta carpeta si quieres mantener la sesión
- Está en `.gitignore` por seguridad
- Haz backup de esta carpeta para no perder la sesión

## 🔧 Comandos Útiles

### Ver Estado de Sesiones
```bash
npx tsx scripts/diagnostico-whatsapp.ts
```

### Forzar Reconexión
```bash
npx tsx scripts/reconectar-whatsapp.ts
```

### Verificar Conexión
```bash
npx tsx scripts/verificar-conexion.ts
```

## 🚨 Solución de Problemas

### Problema: "No recibo mensajes después de reiniciar"

**Solución:**
1. Verifica que el servidor esté corriendo
2. Revisa los logs del SessionManager
3. Si no reconectó automáticamente, ejecuta:
   ```bash
   npx tsx scripts/reconectar-whatsapp.ts
   ```
4. Ve al dashboard y reconecta manualmente

### Problema: "Sesión expirada"

**Solución:**
1. Borra la carpeta `auth_sessions/[userId]`
2. Ve al dashboard
3. Conecta WhatsApp de nuevo
4. Escanea el QR
5. La nueva sesión se guardará automáticamente

### Problema: "Múltiples dispositivos conectados"

**Solución:**
- WhatsApp permite hasta 4 dispositivos vinculados
- Si tienes problemas, desvincula dispositivos antiguos desde tu teléfono
- Ve a: WhatsApp → Configuración → Dispositivos vinculados

## 🎉 Resultado Final

Con este sistema:

✅ **El bot funciona 24/7** sin interrupciones
✅ **No necesitas escanear QR** cada vez que reinicias
✅ **Reconexión automática** si se pierde la conexión
✅ **Acceso desde cualquier lugar** sin perder la sesión
✅ **Monitoreo constante** del estado de la conexión
✅ **Logs detallados** para debugging

¡Tu bot de WhatsApp ahora es completamente autónomo y persistente! 🚀

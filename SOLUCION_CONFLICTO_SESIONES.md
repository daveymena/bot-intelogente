# 🔧 SOLUCIÓN: Conflicto de Sesiones de WhatsApp

## 🎯 Problema Identificado

El sistema estaba entrando en un loop de reconexiones debido a:

1. **Sesiones huérfanas**: Conexiones en la base de datos con `userId` que no existen
2. **Reconexiones automáticas**: El monitor intentaba reconectar incluso cuando había conflictos
3. **Fallback hardcodeado**: El endpoint de reconexión usaba un userId hardcodeado como fallback

### Errores Observados

```
[Baileys] ⚠️ Conflicto detectado: otra sesión está activa
[Baileys] No se reconectará automáticamente para evitar conflictos
[API Reconnect] ❌ Error: Foreign key constraint violated
userId: cmhc22zw20000kmhgvx5ubazy
```

## ✅ Soluciones Implementadas

### 1. Validación de Usuario en Reconexión

**Archivo**: `src/app/api/whatsapp/reconnect/route.ts`

- ✅ Eliminado userId hardcodeado como fallback
- ✅ Validación de sesión activa antes de reconectar
- ✅ Verificación de que el usuario existe en la base de datos
- ✅ Retorno de error 401 si no hay sesión
- ✅ Retorno de error 404 si el usuario no existe

### 2. Monitor de Conexión Mejorado

**Archivo**: `src/lib/connection-monitor.ts`

- ✅ Detección de conflictos de sesión
- ✅ Límite de intentos de reconexión (máximo 3)
- ✅ Pausa automática del monitoreo cuando se detecta conflicto
- ✅ Reseteo de contadores cuando la conexión es exitosa

### 3. Notificación de Conflictos

**Archivo**: `src/lib/baileys-service.ts`

- ✅ Notificación al monitor cuando se detecta un conflicto
- ✅ Detención automática del monitoreo en caso de conflicto
- ✅ Prevención de reconexiones automáticas en conflictos

### 4. Scripts de Limpieza

#### `scripts/limpiar-sesiones-huerfanas.ts`
Limpia conexiones de WhatsApp que no tienen un usuario válido.

```bash
npx tsx scripts/limpiar-sesiones-huerfanas.ts
# O usar el .bat
limpiar-sesiones.bat
```

#### `scripts/resetear-whatsapp-completo.ts`
Resetea completamente la conexión de WhatsApp (elimina todo).

```bash
npx tsx scripts/resetear-whatsapp-completo.ts
# O usar el .bat
resetear-whatsapp-completo.bat
```

## 🚀 Cómo Usar

### Opción 1: Limpiar Sesiones Huérfanas (Recomendado)

Si solo quieres eliminar las sesiones que causan problemas:

```bash
# Windows
limpiar-sesiones.bat

# Linux/Mac
npx tsx scripts/limpiar-sesiones-huerfanas.ts
```

Esto:
- ✅ Identifica conexiones sin usuario válido
- ✅ Las elimina de la base de datos
- ✅ Mantiene las conexiones válidas intactas

### Opción 2: Reset Completo (Si el problema persiste)

Si necesitas empezar desde cero:

```bash
# Windows
resetear-whatsapp-completo.bat

# Linux/Mac
npx tsx scripts/resetear-whatsapp-completo.ts
```

Esto:
- 🗑️ Elimina la conexión de la base de datos
- 🗑️ Elimina los archivos de sesión
- 🗑️ Limpia sesiones huérfanas
- 📱 Te permite escanear el QR de nuevo

## 🔍 Verificar Estado

Después de limpiar, verifica que todo esté bien:

1. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Revisa los logs**:
   - ✅ No deberías ver más errores de `Foreign key constraint`
   - ✅ No deberías ver loops de reconexión
   - ✅ El monitor debería funcionar correctamente

3. **Conecta WhatsApp**:
   - Ve al dashboard
   - Haz clic en "Conectar WhatsApp"
   - Escanea el código QR
   - Espera a que se conecte

## 📊 Comportamiento Esperado

### Conexión Normal
```
[Baileys] Inicializando conexión para usuario: cmhf5rvnh0000kb26y7k63mmc
[Baileys] ✅ Conexión establecida para usuario: cmhf5rvnh0000kb26y7k63mmc
[Baileys] ⏳ Esperando sincronización inicial...
[Monitor] 🔍 Iniciando monitoreo de conexión para cmhf5rvnh0000kb26y7k63mmc
[Baileys] ✅ Bot listo para enviar mensajes
[Monitor] ✅ Conexión activa para cmhf5rvnh0000kb26y7k63mmc
```

### Conflicto Detectado (Correcto)
```
[Baileys] ⚠️ Conflicto detectado: otra sesión está activa
[Baileys] No se reconectará automáticamente para evitar conflictos
[Monitor] ⚠️ Conflicto de sesión detectado para cmhf5rvnh0000kb26y7k63mmc
[Monitor] 🛑 Monitoreo detenido para cmhf5rvnh0000kb26y7k63mmc
```

### Reconexión con Límite
```
[Monitor] ⚠️ Conexión perdida para cmhf5rvnh0000kb26y7k63mmc, reconectando... (intento 1/3)
[Monitor] ⚠️ Conexión perdida para cmhf5rvnh0000kb26y7k63mmc, reconectando... (intento 2/3)
[Monitor] ⚠️ Conexión perdida para cmhf5rvnh0000kb26y7k63mmc, reconectando... (intento 3/3)
[Monitor] 🛑 Máximo de intentos alcanzado para cmhf5rvnh0000kb26y7k63mmc, deteniendo monitoreo
```

## 🛡️ Prevención

Para evitar este problema en el futuro:

1. **No uses múltiples instancias**: Solo ejecuta el servidor una vez
2. **Cierra WhatsApp Web**: Si tienes WhatsApp Web abierto, ciérralo
3. **Un dispositivo a la vez**: Solo escanea el QR desde un teléfono
4. **Limpieza periódica**: Ejecuta `limpiar-sesiones.bat` ocasionalmente

## 🔧 Variables de Entorno

Puedes controlar el monitor de conexión:

```env
# Deshabilitar el monitor (no recomendado)
ENABLE_CONNECTION_MONITOR=false
```

## 📝 Notas Técnicas

### Cambios en el Código

1. **ConnectionMonitor**:
   - Agregado `conflictDetected` Map
   - Agregado `reconnectAttempts` Map
   - Agregado `MAX_RECONNECT_ATTEMPTS = 3`
   - Método `markConflict()` para marcar conflictos
   - Método `clearConflict()` para limpiar marcas

2. **BaileysService**:
   - Llama a `ConnectionMonitor.markConflict()` cuando detecta conflicto
   - Llama a `ConnectionMonitor.stopMonitoring()` en logout

3. **API Reconnect**:
   - Validación de sesión activa
   - Verificación de usuario existente
   - Sin fallback hardcodeado

## ✅ Resultado

Después de aplicar estas soluciones:

- ✅ No más loops de reconexión
- ✅ No más errores de foreign key
- ✅ Detección inteligente de conflictos
- ✅ Límite de intentos de reconexión
- ✅ Limpieza automática de sesiones huérfanas
- ✅ Logs más limpios y organizados

## 🆘 Si el Problema Persiste

1. Ejecuta el reset completo:
   ```bash
   resetear-whatsapp-completo.bat
   ```

2. Reinicia el servidor:
   ```bash
   npm run dev
   ```

3. Verifica que no haya otras instancias del servidor corriendo

4. Revisa que no tengas WhatsApp Web abierto en otro navegador

5. Si aún hay problemas, revisa los logs y busca:
   - Errores de conexión a la base de datos
   - Problemas de permisos en `auth_sessions/`
   - Conflictos de puerto (3000)

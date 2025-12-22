# 🔍 Diagnóstico QR WhatsApp en Easypanel

## Problema Actual

El QR de WhatsApp no se genera o no se muestra en Easypanel, quedando en estado "pending" o "connecting" indefinidamente.

## Solución: Probar Generación por Consola

### Paso 1: Ejecutar Script de Diagnóstico

En la consola de Easypanel, ejecuta:

```bash
npx tsx scripts/test-qr-console.ts
```

Este script:
- ✅ Crea una sesión de prueba
- ✅ Genera el QR en la terminal (ASCII art)
- ✅ Muestra logs detallados de cada paso
- ✅ Detecta errores específicos

### Paso 2: Interpretar Resultados

#### ✅ Caso 1: QR se genera correctamente

Si ves algo como:

```
✅ QR GENERADO EXITOSAMENTE
📱 ESCANEA ESTE QR CON WHATSAPP:

█████████████████████████████
█████████████████████████████
███ ▄▄▄▄▄ █▀█ █▄▄▀▄ ▄▄▄▄▄ ███
███ █   █ █▀▀▀█ ▀█ █   █ ███
...
```

**Significa:** Baileys funciona correctamente. El problema está en:
- Frontend no recibe el QR
- Base de datos no guarda el QR
- Socket.io no transmite el QR

**Solución:** Revisar la ruta `/api/whatsapp/connect` y el componente de React.

#### ❌ Caso 2: QR nunca se genera

Si ves:

```
⏱️  TIMEOUT - No se conectó en 90 segundos
❌ QR nunca fue generado
⚠️  Posible problema con Baileys o red
```

**Significa:** Problema con Baileys o conectividad de red.

**Soluciones posibles:**

1. **Verificar versión de Baileys:**
```bash
npm list @whiskeysockets/baileys
```

Debe ser `7.0.0-rc.6` o superior.

2. **Reinstalar Baileys:**
```bash
npm uninstall @whiskeysockets/baileys
npm install @whiskeysockets/baileys@latest
```

3. **Verificar conectividad:**
```bash
curl -I https://web.whatsapp.com
```

Debe responder con `200 OK`.

4. **Limpiar sesiones antiguas:**
```bash
rm -rf auth_sessions/*
```

#### ⚠️ Caso 3: Error de permisos

Si ves:

```
❌ ERROR: EACCES: permission denied
```

**Solución:**
```bash
chmod -R 755 auth_sessions
```

#### 🔄 Caso 4: Error de conflicto

Si ves:

```
❌ ERROR: conflict - another session is active
```

**Solución:**
```bash
# Limpiar todas las sesiones
rm -rf auth_sessions/*

# Reiniciar aplicación
# (Easypanel lo hace automáticamente)
```

### Paso 3: Probar Conexión Real

Si el test de consola funciona, prueba la conexión real:

```bash
# En Easypanel, ejecutar:
curl -X POST http://localhost:3000/api/whatsapp/connect \
  -H "Cookie: auth-token=TU_TOKEN_AQUI" \
  -v
```

Deberías ver:
```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KG...",
  "message": "QR generado. Escanea con WhatsApp."
}
```

### Paso 4: Verificar Base de Datos

```bash
npx tsx scripts/verificar-estado-whatsapp.ts
```

Debe mostrar:
```
Estado: QR_PENDING
QR Code: data:image/png;base64...
```

## Comandos Útiles en Easypanel

### Ver logs en tiempo real
```bash
# Ver últimas 100 líneas
tail -n 100 /app/.next/server/app/api/whatsapp/connect/route.js

# Seguir logs en vivo
tail -f /var/log/app.log
```

### Limpiar todo y empezar de cero
```bash
# Detener app (Easypanel lo reinicia automáticamente)
pkill -f node

# Limpiar sesiones
rm -rf auth_sessions/*

# Limpiar caché de Next.js
rm -rf .next

# Reinstalar dependencias
npm ci
```

### Verificar variables de entorno
```bash
env | grep -E "(DATABASE_URL|GROQ_API_KEY|NODE_ENV)"
```

## Alternativa: Recrear Aplicación

Si nada funciona, puede ser necesario recrear la aplicación en Easypanel:

1. **Exportar variables de entorno** (copiar desde Easypanel UI)
2. **Eliminar aplicación actual**
3. **Crear nueva aplicación** desde GitHub
4. **Importar variables de entorno**
5. **Desplegar**

Ver: `RECREAR_APP_EASYPANEL.md`

## Checklist de Verificación

- [ ] Script de test genera QR por consola
- [ ] API `/api/whatsapp/connect` responde correctamente
- [ ] Base de datos guarda el QR
- [ ] Frontend recibe el QR
- [ ] No hay conflictos de sesión
- [ ] Permisos correctos en `auth_sessions/`
- [ ] Variables de entorno configuradas
- [ ] Baileys versión correcta

## Próximos Pasos

1. **Ejecutar:** `npx tsx scripts/test-qr-console.ts`
2. **Copiar output completo** y compartir
3. **Identificar** en qué paso falla
4. **Aplicar solución** específica

---

**Nota:** Este script es seguro y no afecta sesiones existentes. Crea una sesión de prueba temporal en `auth_sessions/test-console/`.

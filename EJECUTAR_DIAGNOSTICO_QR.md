# 🚀 Ejecutar Diagnóstico de QR - AHORA

## Problema

El QR de WhatsApp no se genera en Easypanel y queda en estado "pending".

## Solución Inmediata

### 1️⃣ Conectarse a Easypanel por SSH o Consola

En Easypanel, ve a tu aplicación → **Terminal** o **Console**.

### 2️⃣ Ejecutar Script de Diagnóstico

```bash
npx tsx scripts/test-qr-console.ts
```

**Esto va a:**
- ✅ Intentar generar un QR real
- ✅ Mostrarlo en la consola (ASCII art)
- ✅ Detectar errores específicos
- ✅ Darte un diagnóstico claro

### 3️⃣ Interpretar el Resultado

#### ✅ Si ves el QR en la consola:

```
✅ QR GENERADO EXITOSAMENTE
📱 ESCANEA ESTE QR CON WHATSAPP:

█████████████████████████████
███ ▄▄▄▄▄ █▀█ █▄▄▀▄ ▄▄▄▄▄ ███
...
```

**Significa:** Baileys funciona. El problema es que el frontend no lo recibe.

**Solución:**
```bash
# Verificar estado en DB
npx tsx scripts/verificar-estado-whatsapp.ts

# Si el QR está en DB pero no en frontend, reiniciar app
npm run build
```

#### ❌ Si NO se genera el QR:

```
⏱️  TIMEOUT - No se conectó en 90 segundos
❌ QR nunca fue generado
```

**Significa:** Problema con Baileys o red.

**Solución:**
```bash
# Opción 1: Limpiar sesiones
rm -rf auth_sessions/*

# Opción 2: Reinstalar Baileys
npm uninstall @whiskeysockets/baileys
npm install @whiskeysockets/baileys@latest

# Opción 3: Verificar red
curl -I https://web.whatsapp.com
```

### 4️⃣ Verificar Estado Actual

```bash
npx tsx scripts/verificar-estado-whatsapp.ts
```

Esto te muestra:
- Estado actual de la conexión
- Si hay QR guardado en DB
- Errores recientes
- Recomendaciones específicas

### 5️⃣ Limpiar y Reintentar (si es necesario)

```bash
# Limpiar todo
npx tsx scripts/resetear-whatsapp-completo.ts

# Reiniciar aplicación (Easypanel lo hace automáticamente)
```

## Comandos Rápidos

### Ver logs en tiempo real
```bash
tail -f /var/log/app.log | grep -i whatsapp
```

### Verificar variables de entorno
```bash
env | grep DATABASE_URL
```

### Limpiar caché de Next.js
```bash
rm -rf .next
npm run build
```

## Si Nada Funciona

### Opción Nuclear: Recrear Aplicación

1. **Exportar variables de entorno** (copiarlas desde Easypanel UI)
2. **Eliminar aplicación** en Easypanel
3. **Crear nueva aplicación** desde el mismo repositorio
4. **Pegar variables de entorno**
5. **Desplegar**

Ver guía completa: `RECREAR_APP_EASYPANEL.md`

## Checklist de Verificación

Ejecuta estos comandos en orden:

```bash
# 1. Test de QR por consola
npx tsx scripts/test-qr-console.ts

# 2. Verificar estado en DB
npx tsx scripts/verificar-estado-whatsapp.ts

# 3. Si falla, limpiar sesiones
rm -rf auth_sessions/*

# 4. Reintentar
npx tsx scripts/test-qr-console.ts

# 5. Si sigue fallando, reinstalar Baileys
npm install @whiskeysockets/baileys@latest

# 6. Último intento
npx tsx scripts/test-qr-console.ts
```

## Resultado Esperado

Deberías ver algo como:

```
✅ QR GENERADO EXITOSAMENTE
📱 ESCANEA ESTE QR CON WHATSAPP:

[QR CODE ASCII ART]

✅ QR listo para escanear
⏳ Esperando escaneo (60 segundos)...
```

Si ves esto, **el sistema funciona correctamente** y solo necesitas escanear el QR desde tu teléfono.

## Próximo Paso

Una vez que el QR se genere por consola:

1. **Copia el output completo**
2. **Compártelo** para análisis
3. **Identifica** dónde está el problema (frontend, DB, o red)
4. **Aplica** la solución específica

---

**Ejecuta ahora:** `npx tsx scripts/test-qr-console.ts`

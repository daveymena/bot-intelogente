# 🔧 Arreglar Número "pending" en Easypanel

## 🔍 Problema

- Dashboard muestra "Conectado" ✅
- Pero el número dice "**pending**" ⚠️
- Los mensajes no llegan al bot ❌
- No aparecen en los logs ❌

## 🎯 Causa

El estado en la base de datos tiene:
- `phoneNumber: "pending"` ❌
- `status: "QR_PENDING"` o `"CONNECTING"` ❌

Debe tener:
- `phoneNumber: "573042748687"` ✅
- `status: "CONNECTED"` ✅
- `isConnected: true` ✅

---

## ✅ Solución Rápida (2 minutos)

### Desde Terminal de Easypanel:

1. **Abre el Terminal** en Easypanel
2. **Ejecuta este comando**:

```bash
npx tsx scripts/arreglar-numero-pending.ts
```

3. **Espera a que termine** (10 segundos)
4. **Recarga el dashboard** (F5)
5. **Envía un mensaje de prueba**

---

## 📋 Qué Hace el Script

1. ✅ Busca conexiones con número "pending"
2. ✅ Actualiza el número a `573042748687`
3. ✅ Cambia el estado a `CONNECTED`
4. ✅ Marca `isConnected: true`
5. ✅ Actualiza última conexión

---

## 🔍 Verificación

### Después de ejecutar el script:

1. **Recarga el dashboard** (F5)
2. **Verifica que muestre**:
   - Número: `573042748687` (o tu número real)
   - Estado: Conectado ✅
   - Última conexión: Ahora

3. **Envía un mensaje de prueba**:
   - Desde otro WhatsApp
   - Envía: "Hola"
   - Debe aparecer en el dashboard
   - El bot debe responder

---

## 🆘 Si No Funciona

### Opción 1: Ejecutar diagnóstico completo

```bash
npx tsx scripts/diagnosticar-whatsapp-completo.ts
```

Esto te mostrará:
- Estado de la conexión
- Usuarios
- Conversaciones
- Últimos mensajes

### Opción 2: Reconectar WhatsApp

1. Ve al dashboard
2. Sección "WhatsApp"
3. Haz clic en "Desconectar"
4. Haz clic en "Conectar"
5. Escanea el código QR nuevamente

### Opción 3: Verificar logs

En Easypanel, ve a "Logs" y busca:
- Errores de conexión
- Mensajes entrantes
- Respuestas del bot

---

## 📝 Comandos Útiles

### Ver estado actual:
```bash
npx tsx scripts/diagnosticar-whatsapp-completo.ts
```

### Arreglar número pending:
```bash
npx tsx scripts/arreglar-numero-pending.ts
```

### Arreglar conexión:
```bash
npx tsx scripts/arreglar-conexion-whatsapp.ts
```

### Ver productos:
```bash
npx tsx scripts/mostrar-ubicacion-productos.ts
```

---

## 🎯 Resultado Esperado

Después de ejecutar el script:

```
✅ Usuario: tu-email@gmail.com
✅ Número: 573042748687
✅ Estado: CONNECTED
✅ Conectado: SÍ
✅ Última conexión: Ahora
```

Dashboard mostrará:
```
Número conectado: 573042748687
Última conexión: Ahora
✅ Bot Activo
```

Mensajes:
```
✅ Llegan al bot
✅ Aparecen en el dashboard
✅ El bot responde automáticamente
```

---

## 💡 Prevención

Para evitar este problema en el futuro:

1. **No editar la BD manualmente**
2. **Usar los scripts de arreglo**
3. **Si reconectas WhatsApp**, ejecuta:
   ```bash
   npx tsx scripts/arreglar-conexion-whatsapp.ts
   ```

---

**Fecha**: 4 de noviembre de 2025  
**Problema**: Número "pending"  
**Solución**: Script de arreglo  
**Tiempo**: 2 minutos

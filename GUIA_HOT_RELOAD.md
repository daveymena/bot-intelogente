# 🔥 GUÍA DE HOT RELOAD - Cambios en Vivo

## ¿Qué es Hot Reload?

Hot Reload permite que el bot detecte y aplique cambios automáticamente **sin necesidad de reiniciar el servidor**. Esto es especialmente útil cuando:

- ✅ Agregas o actualizas productos
- ✅ Cambias configuraciones
- ✅ Modificas prompts de IA
- ✅ Actualizas precios o descripciones

## 🎯 Beneficios

### Antes (Sin Hot Reload)
```
1. Modificas un producto en la base de datos
2. Detienes el servidor (Ctrl+C)
3. Reinicias el servidor (npm run dev)
4. Esperas que cargue todo
5. Reconectas WhatsApp
6. Escaneas QR de nuevo
7. Ahora sí funciona el cambio
```

### Ahora (Con Hot Reload)
```
1. Modificas un producto en la base de datos
2. Esperas 30 segundos
3. ¡El bot ya tiene los cambios! ✨
```

## ⚙️ Configuración

### 1. Verificar que está habilitado

En tu archivo `.env`:
```env
HOT_RELOAD_ENABLED=true
```

### 2. Intervalos de recarga

El sistema verifica cambios automáticamente:

- **Productos**: Cada 30 segundos
- **Configuración**: Cada 15 segundos
- **Archivos de prompts**: En tiempo real (cuando se guardan)

## 🔄 Qué se recarga automáticamente

### ✅ Productos
- Nuevos productos agregados
- Productos actualizados (precio, descripción, etc.)
- Productos eliminados
- Cambios en disponibilidad (stock)
- Cambios en imágenes

### ✅ Configuración
- Configuración del bot
- Respuestas automáticas
- Configuración de pagos
- Configuración de IA

### ✅ Prompts de IA
- Archivos `agregar-prompt-*.ts`
- Cambios en prompts personalizados
- Actualizaciones de contexto

## 📋 Cómo usar Hot Reload

### Ejemplo 1: Agregar un producto

```bash
# 1. Ejecutar script para agregar producto
npm run tsx scripts/agregar-motos.ts

# 2. Esperar 30 segundos
# El bot mostrará en consola:
# [Hot Reload] 🔄 Productos actualizados, recargando caché...
# [Baileys] 🔄 Recargando productos...
# [Baileys] ✅ 15 productos recargados

# 3. ¡Listo! El bot ya conoce el nuevo producto
```

### Ejemplo 2: Actualizar precio

```typescript
// En cualquier script o desde Prisma Studio
await db.product.update({
  where: { id: 'producto-id' },
  data: { price: 199.99 }
})

// Esperar 30 segundos y el bot tendrá el nuevo precio
```

### Ejemplo 3: Cambiar configuración

```typescript
await db.settings.upsert({
  where: { key: 'bot_greeting' },
  update: { value: '¡Hola! Soy tu nuevo asistente 🤖' },
  create: {
    key: 'bot_greeting',
    value: '¡Hola! Soy tu nuevo asistente 🤖',
    userId: 'user-id'
  }
})

// Esperar 15 segundos y el bot usará el nuevo saludo
```

## 🧪 Probar Hot Reload

### Opción 1: Script de prueba automático

```bash
npm run tsx scripts/test-hot-reload.ts
```

Este script:
1. Crea un producto de prueba
2. Espera a que el bot lo detecte
3. Actualiza el producto
4. Espera a que el bot detecte el cambio
5. Limpia el producto de prueba

### Opción 2: Prueba manual

1. **Inicia el bot:**
   ```bash
   npm run dev
   ```

2. **En otra terminal, agrega un producto:**
   ```bash
   npm run tsx scripts/agregar-motos.ts
   ```

3. **Observa los logs del bot:**
   ```
   [Hot Reload] 🔄 Productos actualizados, recargando caché...
   [Baileys] 🔄 Recargando productos...
   [Baileys] ✅ 15 productos recargados
   ```

4. **Envía un mensaje al bot preguntando por el producto**
   - El bot debería conocer el nuevo producto sin reiniciar

## 📊 Monitoreo

### Ver logs de Hot Reload

Los logs te mostrarán cuando se detecten cambios:

```
[Hot Reload] 🔥 Inicializando sistema de hot reload...
[Hot Reload] ✅ Sistema de hot reload activo

[Hot Reload] 🔄 Productos actualizados, recargando caché...
[Baileys] 🔄 Recargando productos...
[Baileys] ✅ 15 productos recargados

[Hot Reload] 🔄 Configuración actualizada, recargando...
[Baileys] 🔄 Recargando configuración...
[Baileys] ✅ Configuración recargada
```

### Forzar recarga manual

Si necesitas forzar una recarga inmediata (sin esperar los 30 segundos):

```typescript
import { HotReloadService } from './src/lib/hot-reload-service'

// Forzar recarga de productos
await HotReloadService.reloadProducts()

// Forzar recarga de configuración
await HotReloadService.reloadSettings()
```

## 🎛️ Configuración Avanzada

### Cambiar intervalos de recarga

Edita `src/lib/hot-reload-service.ts`:

```typescript
// Productos cada 10 segundos (más rápido)
}, 10000)

// Configuración cada 5 segundos (más rápido)
}, 5000)
```

### Deshabilitar Hot Reload

En `.env`:
```env
HOT_RELOAD_ENABLED=false
```

O temporalmente:
```bash
HOT_RELOAD_ENABLED=false npm run dev
```

## 🔍 Troubleshooting

### El bot no detecta cambios

1. **Verifica que Hot Reload esté habilitado:**
   ```bash
   # En .env
   HOT_RELOAD_ENABLED=true
   ```

2. **Verifica los logs:**
   - Deberías ver `[Hot Reload] ✅ Sistema de hot reload activo`
   - Si no lo ves, hot reload no se inició

3. **Espera el tiempo suficiente:**
   - Productos: 30 segundos
   - Configuración: 15 segundos

4. **Verifica que el cambio se guardó en la base de datos:**
   ```bash
   # Abrir Prisma Studio
   npx prisma studio
   
   # Verificar que el cambio está en la DB
   ```

### Hot Reload consume mucha memoria

Si tienes muchos productos (>1000), considera:

1. **Aumentar el intervalo:**
   ```typescript
   }, 60000) // Cada 60 segundos
   ```

2. **Usar caché selectivo:**
   - Solo cargar productos activos
   - Paginar resultados

3. **Deshabilitar temporalmente:**
   ```env
   HOT_RELOAD_ENABLED=false
   ```

## 💡 Mejores Prácticas

### ✅ DO (Hacer)

- Usa hot reload para cambios frecuentes
- Monitorea los logs para confirmar recargas
- Espera el tiempo de intervalo antes de probar
- Usa scripts para cambios masivos

### ❌ DON'T (No hacer)

- No esperes cambios instantáneos (hay un delay)
- No hagas cambios mientras el bot está procesando
- No desactives hot reload en producción
- No modifiques archivos de código en caliente (solo datos)

## 🚀 Casos de Uso

### 1. Actualización de Catálogo

```bash
# Agregar 10 productos nuevos
npm run tsx scripts/agregar-productos-masivo.ts

# Esperar 30 segundos
# ¡El bot ya los conoce!
```

### 2. Cambio de Precios

```bash
# Actualizar precios con descuento
npm run tsx scripts/aplicar-descuento.ts

# Esperar 30 segundos
# El bot responde con nuevos precios
```

### 3. Actualizar Prompts

```bash
# Editar archivo de prompt
nano scripts/agregar-prompt-moto.ts

# Guardar (Ctrl+O, Enter, Ctrl+X)
# ¡Cambio detectado inmediatamente!
```

## 📈 Rendimiento

### Impacto en recursos

- **CPU**: Mínimo (~1% cada verificación)
- **Memoria**: ~10-50MB para caché de productos
- **Red**: 0 (solo consultas locales a DB)
- **Disco**: Mínimo (solo lecturas de DB)

### Optimizaciones

El sistema está optimizado para:
- Solo recargar cuando hay cambios reales
- Usar caché en memoria
- Consultas eficientes a la base de datos
- No bloquear el procesamiento de mensajes

## 🎉 Resultado Final

Con Hot Reload activado:

1. ✅ Actualizas productos → Bot los conoce en 30 segundos
2. ✅ Cambias configuración → Bot la aplica en 15 segundos
3. ✅ Modificas prompts → Bot los usa inmediatamente
4. ✅ No reinicias servidor → WhatsApp sigue conectado
5. ✅ No escaneas QR de nuevo → Sesión se mantiene
6. ✅ Clientes no notan interrupciones → Servicio continuo

**¡Tu bot ahora trabaja en vivo sin interrupciones!** 🔥

---

**Archivo de servicio:** `src/lib/hot-reload-service.ts`
**Script de prueba:** `scripts/test-hot-reload.ts`
**Configuración:** `.env` → `HOT_RELOAD_ENABLED=true`

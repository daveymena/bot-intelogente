# 🔍 DIAGNÓSTICO: Por qué las fotos NO se envían automáticamente

## ✅ Lo que SÍ funciona:

1. **El producto tiene foto:**
   - Curso Piano: `"/fotos/curso de piano completo .jpg"` ✅
   
2. **El servicio de fotos funciona:**
   - `obtenerFotosProducto()` convierte rutas locales a URLs ✅
   - Retorna array con fotos válidas ✅

3. **El código está correcto:**
   - Import de `obtenerFotosProducto` existe ✅
   - Se llama en el controlador ✅
   - Se retorna `{ texto, fotos }` ✅

## ❌ El Problema:

**Las fotos NO se envían** cuando el bot responde sobre un producto.

## 🔍 Posibles Causas

### Causa 1: Servidor no reiniciado (80% probable)

**Síntoma:**
- Código correcto pero no se aplica
- Cambios recientes no activos

**Solución:**
```bash
# Ctrl+C para detener
npm run dev
```

### Causa 2: El flujo no retorna las fotos (15% probable)

**Síntoma:**
- `obtenerFotosProducto()` se llama
- Pero el flujo (flujoDigital, etc.) no las pasa

**Verificación:**
Buscar en logs:
```
[Conversación] 📸 Producto tiene X fotos disponibles
```

Si NO aparece este log, el problema está en el flujo.

**Solución:**
Verificar que `dirigirAFlujo()` retorne las fotos.

### Causa 3: Baileys no envía las fotos (5% probable)

**Síntoma:**
- El bot genera `{ texto, fotos: [...] }`
- Pero Baileys no las envía por WhatsApp

**Verificación:**
Buscar en logs:
```
[Baileys] Enviando foto: [URL]
```

Si NO aparece, el problema está en Baileys.

**Solución:**
Verificar servicio de Baileys.

## 🔧 Solución Paso a Paso

### Paso 1: Verificar que el código está actualizado

```bash
# Ver el archivo photoService.ts
# Debe tener la función obtenerFotosProducto con conversión de rutas
```

### Paso 2: Reiniciar servidor

```bash
# Detener (Ctrl+C)
npm run dev
```

### Paso 3: Probar y ver logs

Enviar: **"curso de piano"**

Buscar en logs:
```
[PhotoService] 🔍 Buscando fotos para: Curso Piano...
[PhotoService] 📸 Imágenes raw: ["/fotos/..."]
[PhotoService] 🔄 Convertido: /fotos/... → https://...
[PhotoService] ✅ 1 foto(s) lista(s) para enviar
[Conversación] 📸 Producto tiene 1 fotos disponibles
```

### Paso 4: Si los logs NO aparecen

**Problema:** `obtenerFotosProducto()` no se está llamando

**Solución:**
Verificar que el controlador llama la función:

```typescript
// En conversacionController.ts, línea ~370
const fotosProducto = obtenerFotosProducto(producto);
if (fotosProducto.length > 0) {
  console.log(`[Conversación] 📸 Producto tiene ${fotosProducto.length} fotos disponibles`);
  return {
    texto: respuestaFinal,
    fotos: fotosProducto
  };
}
```

### Paso 5: Si los logs SÍ aparecen pero no se envían

**Problema:** Baileys no está enviando las fotos

**Solución:**
Verificar el servicio de Baileys que maneja el envío.

## 📊 Test de Diagnóstico

```bash
# Ejecutar test
node test-fotos-curso-piano.js
```

**Resultado esperado:**
```
✅ El curso de piano TIENE fotos
✅ Las fotos DEBERÍAN enviarse automáticamente
```

## 🎯 Logs Esperados (Correcto)

Cuando funciona correctamente, deberías ver:

```
[Conversación] Cliente: +57304..., Mensaje: curso de piano
[BuscarProductos] 🎯 Producto específico: Curso Piano...
[PhotoService] 🔍 Buscando fotos para: Curso Piano...
[PhotoService] 📸 Imágenes raw: ["/fotos/curso de piano completo .jpg"]
[PhotoService] 🔄 Convertido: /fotos/... → https://tu-dominio.../fotos/...
[PhotoService] ✅ 1 foto(s) lista(s) para enviar
[PhotoService] 📸 Primera foto: https://tu-dominio.../fotos/...
[Conversación] 📸 Producto tiene 1 fotos disponibles
[Baileys] Enviando mensaje con foto...
[Baileys] ✅ Foto enviada
```

## 🚨 Logs Incorrectos (Problema)

Si ves esto, hay un problema:

```
[Conversación] Cliente: +57304..., Mensaje: curso de piano
[BuscarProductos] 🎯 Producto específico: Curso Piano...
[Conversación] Respuesta generada: ...
```

**Falta:** Los logs de `[PhotoService]` y `[Conversación] 📸`

**Causa:** `obtenerFotosProducto()` no se está llamando o el servidor no se reinició.

## ✅ Checklist de Verificación

- [ ] Servidor reiniciado después de cambios
- [ ] Test de fotos ejecutado (`node test-fotos-curso-piano.js`)
- [ ] Logs muestran `[PhotoService]`
- [ ] Logs muestran `[Conversación] 📸`
- [ ] Logs muestran `[Baileys] Enviando foto`
- [ ] Foto se recibe en WhatsApp

## 🔧 Solución Rápida

Si nada funciona, verificar manualmente:

1. **Abrir:** `src/conversational-module/ai/conversacionController.ts`
2. **Buscar:** línea ~370
3. **Verificar que existe:**
   ```typescript
   const fotosProducto = obtenerFotosProducto(producto);
   if (fotosProducto.length > 0) {
     return { texto: respuestaFinal, fotos: fotosProducto };
   }
   ```
4. **Si NO existe:** El código se perdió, restaurar
5. **Si SÍ existe:** Reiniciar servidor

## 📝 Archivos Involucrados

1. **`src/conversational-module/services/photoService.ts`**
   - Función `obtenerFotosProducto()`
   - Convierte rutas locales a URLs

2. **`src/conversational-module/ai/conversacionController.ts`**
   - Llama `obtenerFotosProducto()`
   - Retorna `{ texto, fotos }`

3. **`src/lib/baileys-stable-service.ts`** (probablemente)
   - Recibe `{ texto, fotos }`
   - Envía fotos por WhatsApp

## 🎯 Conclusión

**Causa más probable:** Servidor no reiniciado después de los cambios.

**Solución:** Reiniciar servidor y probar de nuevo.

---

**ACCIÓN AHORA:** Reiniciar servidor (Ctrl+C → npm run dev)

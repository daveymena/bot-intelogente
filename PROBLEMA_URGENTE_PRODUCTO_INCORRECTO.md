# 🚨 PROBLEMA URGENTE: Producto Incorrecto

## ❌ Problema Detectado

**Usuario pidió:** "Me interesa el curso de piano"
**Bot respondió:** "Mega Pack 21: Pack Sublimado"

**Esto es CRÍTICO** - El bot está devolviendo productos completamente incorrectos.

---

## 🔍 Diagnóstico

### Posibles Causas:

1. **Servidor NO reiniciado** después de los cambios
   - Los cambios en `.env` y código NO se aplicaron
   - Sigue usando configuración antigua

2. **Ollama NO está funcionando**
   - Puede estar usando fallback de keywords
   - Fallback está devolviendo producto incorrecto

3. **Base de datos tiene problema**
   - No encuentra "curso de piano"
   - Devuelve producto aleatorio

---

## ✅ SOLUCIÓN INMEDIATA (3 Pasos)

### Paso 1: Verificar que existe el curso de piano

```bash
node ver-curso-piano.js
```

**Esperado:** Debe mostrar el curso de piano con su ID y precio

### Paso 2: REINICIAR SERVIDOR (OBLIGATORIO)

```bash
# Detener servidor actual (Ctrl+C)
# Esperar 5 segundos
npm run dev
```

**IMPORTANTE:** Los cambios en `.env` solo se aplican al reiniciar.

### Paso 3: Probar de nuevo

Enviar mensaje: **"curso de piano"**

---

## 🔧 Si Sigue Fallando

### Verificación 1: Ver logs del servidor

Buscar en la consola:
```
[BuscarProductos] 🧠 Iniciando búsqueda semántica inteligente...
[BuscarProductos] ✅ Búsqueda semántica exitosa
[BuscarProductos] 🎯 Producto específico: [NOMBRE DEL PRODUCTO]
```

**Si ves "Pack Sublimado"** → Ollama está confundido

### Verificación 2: Verificar .env

```bash
# Abrir .env y verificar:
USE_OLLAMA=true
OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
OLLAMA_TIMEOUT=30000
```

### Verificación 3: Probar Ollama directamente

```bash
curl https://ollama-ollama.ginee6.easypanel.host/api/tags
```

**Esperado:** Lista de modelos disponibles

---

## 🚨 SOLUCIÓN DE EMERGENCIA

Si Ollama sigue fallando, **desactivar temporalmente**:

```env
# En .env
USE_OLLAMA=false
```

Esto hará que use el sistema de búsqueda por keywords que es más confiable.

---

## 📊 Verificar Base de Datos

```bash
# Ver todos los productos con "piano"
node verificar-productos-usuario.js
```

Debe mostrar:
- Curso de Piano
- Precio
- Categoría: DIGITAL
- Imágenes

---

## 🎯 Causa Más Probable

**El servidor NO se reinició** después de cambiar `.env`

### Solución:
1. Cerrar COMPLETAMENTE el servidor (Ctrl+C)
2. Esperar 5 segundos
3. Iniciar de nuevo: `npm run dev`
4. Esperar a ver: "Server running on port 3000"
5. Probar de nuevo

---

## 📝 Logs Esperados (Correctos)

```
[Conversación] Cliente: +57304..., Mensaje: curso de piano
[BuscarProductos] 🧠 Iniciando búsqueda semántica inteligente...
[Ollama] 🤖 Enviando a gemma2:2b
[Ollama] ✅ Respuesta recibida
[BuscarProductos] ✅ Búsqueda semántica exitosa
[BuscarProductos] 🎯 Producto específico: Curso Completo de Piano
[Conversación] 🎯 PRODUCTO SELECCIONADO: Curso Completo de Piano
```

---

## 📝 Logs Incorrectos (Problema)

```
[BuscarProductos] ❌ Error en Ollama
[BuscarProductos] 🔄 Usando búsqueda por keywords (fallback)
[BuscarProductos] 🎯 Producto específico: Mega Pack 21
```

Si ves esto, Ollama NO está funcionando.

---

## ✅ Checklist de Verificación

- [ ] Servidor reiniciado completamente
- [ ] `.env` tiene `USE_OLLAMA=true`
- [ ] Ollama responde (curl test)
- [ ] Base de datos tiene curso de piano
- [ ] Logs muestran búsqueda semántica exitosa
- [ ] Producto devuelto es correcto

---

## 🆘 Si Nada Funciona

### Opción 1: Usar búsqueda por keywords

```env
USE_OLLAMA=false
```

### Opción 2: Verificar productos en BD

```bash
node ver-curso-piano.js
```

Si NO existe el curso de piano, hay que agregarlo.

### Opción 3: Ver logs completos

```bash
npm run dev > logs.txt 2>&1
```

Luego buscar "piano" en logs.txt

---

## 🚀 Acción INMEDIATA

**AHORA MISMO:**

1. **DETENER servidor** (Ctrl+C)
2. **ESPERAR 5 segundos**
3. **INICIAR servidor** (`npm run dev`)
4. **ESPERAR** a que cargue completamente
5. **PROBAR** con "curso de piano"

---

**Estado:** 🚨 URGENTE - Requiere reinicio inmediato del servidor
**Prioridad:** CRÍTICA
**Tiempo estimado:** 2 minutos

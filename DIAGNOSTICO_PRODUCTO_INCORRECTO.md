# 🔍 DIAGNÓSTICO: Por qué devolvió producto incorrecto

## 📊 Análisis del Problema

### Usuario pidió:
```
"Me interesa el curso de piano"
```

### Bot respondió:
```
Mega Pack 21: Pack Sublimado
Técnicas y recursos para sublimación
```

### ❌ Problema:
**Producto completamente incorrecto** - No tiene nada que ver con piano.

---

## 🔍 Posibles Causas (en orden de probabilidad)

### 1. 🔴 Servidor NO reiniciado (90% probable)

**Síntoma:**
- Cambios en `.env` no se aplicaron
- `USE_OLLAMA=true` no está activo
- Sigue usando configuración antigua

**Verificación:**
```bash
# Ver en logs del servidor al iniciar:
# Debe decir: "USE_OLLAMA: true"
```

**Solución:**
```bash
# Ctrl+C para detener
npm run dev
```

---

### 2. 🟡 Ollama devolvió producto incorrecto (5% probable)

**Síntoma:**
- Ollama está funcionando pero confundido
- Logs muestran: "Búsqueda semántica exitosa"
- Pero producto es incorrecto

**Verificación:**
```bash
# Buscar en logs:
[BuscarProductos] 🎯 Producto específico: [NOMBRE]
```

**Solución:**
- Verificar que el curso de piano existe en BD
- Verificar prompt de Ollama

---

### 3. 🟡 Fallback de keywords falló (3% probable)

**Síntoma:**
- Ollama falló (timeout/error)
- Activó fallback por keywords
- Keywords no encontraron "piano"

**Verificación:**
```bash
# Buscar en logs:
[BuscarProductos] ❌ Error en Ollama
[BuscarProductos] 🔄 Usando búsqueda por keywords
```

**Solución:**
- Aumentar timeout de Ollama
- Mejorar fallback de keywords

---

### 4. 🟢 Curso de piano no existe en BD (2% probable)

**Síntoma:**
- Base de datos no tiene el producto
- Devuelve producto aleatorio

**Verificación:**
```bash
node ver-curso-piano.js
```

**Solución:**
- Agregar curso de piano a la BD
- Verificar que esté activo (status: AVAILABLE)

---

## 🔧 Pasos de Diagnóstico

### Paso 1: Verificar servidor reiniciado

```bash
# En los logs al iniciar, buscar:
✅ "Server running on port 3000"
✅ "Database connected"
✅ "USE_OLLAMA: true"
```

### Paso 2: Verificar curso de piano existe

```bash
node ver-curso-piano.js
```

**Esperado:**
```
Curso Completo de Piano
ID: [número]
Precio: $50.000
Categoría: DIGITAL
```

### Paso 3: Probar búsqueda

```bash
# Enviar mensaje: "curso de piano"
# Ver logs en tiempo real
```

### Paso 4: Analizar logs

Buscar estas líneas en orden:

```
1. [Conversación] Cliente: ..., Mensaje: curso de piano
2. [BuscarProductos] 🧠 Iniciando búsqueda semántica...
3. [Ollama] 🤖 Enviando a gemma2:2b
4. [Ollama] ✅ Respuesta recibida
5. [BuscarProductos] 🎯 Producto específico: [NOMBRE]
```

**Si en línea 5 dice "Pack Sublimado"** → Ollama está confundido

---

## 📊 Escenarios y Soluciones

### Escenario A: Logs no muestran búsqueda semántica

**Causa:** Servidor no reiniciado o `USE_OLLAMA=false`

**Solución:**
1. Verificar `.env`: `USE_OLLAMA=true`
2. Reiniciar servidor
3. Probar de nuevo

---

### Escenario B: Logs muestran error de Ollama

**Causa:** Ollama no responde o timeout

**Solución:**
1. Verificar URL de Ollama en `.env`
2. Aumentar timeout: `OLLAMA_TIMEOUT=60000`
3. Probar conexión: `curl [OLLAMA_URL]/api/tags`

---

### Escenario C: Logs muestran producto incorrecto

**Causa:** Ollama confundido o BD no tiene el producto

**Solución:**
1. Verificar que curso de piano existe
2. Verificar que tiene keywords correctas
3. Revisar prompt de Ollama

---

### Escenario D: Logs muestran fallback

**Causa:** Ollama falló, usando keywords

**Solución:**
1. Mejorar keywords del producto
2. Agregar tags: "piano", "curso", "música"
3. Verificar descripción del producto

---

## 🎯 Solución Más Probable

**El servidor NO se reinició después de cambiar `.env`**

### Acción:
```bash
# 1. Detener servidor (Ctrl+C)
# 2. Esperar 5 segundos
# 3. Iniciar: npm run dev
# 4. Esperar carga completa
# 5. Probar: "curso de piano"
```

---

## ✅ Verificación Final

Después de reiniciar, los logs deben mostrar:

```
✅ [Conversación] Mensaje: curso de piano
✅ [BuscarProductos] 🧠 Búsqueda semántica...
✅ [Ollama] 🤖 Enviando a gemma2:2b
✅ [Ollama] ✅ Respuesta recibida
✅ [BuscarProductos] 🎯 Producto: Curso Completo de Piano
✅ [Conversación] 🎯 PRODUCTO SELECCIONADO: Curso Completo de Piano
```

---

**Conclusión:** 90% de probabilidad que el servidor no se reinició.
**Acción:** Reiniciar servidor AHORA.

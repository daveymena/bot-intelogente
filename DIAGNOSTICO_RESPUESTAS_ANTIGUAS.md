# 🔍 DIAGNÓSTICO: RESPUESTAS ANTIGUAS

**Problema**: El bot usa respuestas antiguas y no se ve Ollama/Groq trabajando

---

## 🎯 CAUSAS POSIBLES

### 1. Servidor no reiniciado
El código cambió pero el servidor sigue corriendo con código antiguo

### 2. Cache de Next.js
Next.js tiene cache que no se actualizó

### 3. Múltiples instancias de Node
Hay varios procesos de Node corriendo

---

## ⚡ SOLUCIÓN INMEDIATA

### Paso 1: Cerrar TODO
```bash
# Presiona Ctrl+C en la terminal del servidor
# O ejecuta:
taskkill /F /IM node.exe
```

### Paso 2: Limpiar cache
```bash
# Ejecuta:
REINICIAR_LIMPIO.bat
```

### Paso 3: Verificar logs
Cuando envíes un mensaje, debes ver:
```
[BuscarProductos] 🧠 Iniciando búsqueda semántica...
🤖 Usando Groq como proveedor principal...
✅ Respuesta de Groq recibida
```

---

## 🔍 VERIFICAR QUÉ ESTÁ PASANDO

### Ver logs completos
Cuando el cliente envía "Me interesa el curso de piano", debes ver:

```
[Baileys] 📨 Mensaje procesado
[Conversación] Intención: busqueda_producto
[BuscarProductos] 🧠 Iniciando búsqueda semántica...
[AI] 🚀 Usando Groq como proveedor principal...
✅ Respuesta de Groq recibida
[BuscarProductos] ✅ Búsqueda semántica exitosa
[BuscarProductos] 💡 Razón: Cliente busca curso de piano
[BuscarProductos] 📊 Confianza: 90%
📤 Enviando respuesta al cliente...
```

### Si NO ves estos logs:
El servidor está usando código antiguo

---

## 🛠️ SOLUCIONES

### Solución 1: Reinicio limpio (Recomendado)
```bash
REINICIAR_LIMPIO.bat
```

### Solución 2: Manual
```bash
# 1. Cerrar servidor
Ctrl+C

# 2. Matar procesos Node
taskkill /F /IM node.exe

# 3. Limpiar cache
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# 4. Reiniciar
npm run dev
```

### Solución 3: Verificar puerto
```bash
# Ver qué está corriendo en puerto 3000
netstat -ano | findstr :3000

# Matar proceso específico
taskkill /F /PID [número_del_proceso]
```

---

## 📊 CONFIGURACIÓN ACTUAL

Verificar `.env`:
```env
USE_OLLAMA=false          ← Debe estar en false
AI_FALLBACK_ENABLED=true  ← Debe estar en true
GROQ_API_KEY=gsk_...      ← Debe tener API key
```

---

## ✅ CHECKLIST

Antes de probar de nuevo:

- [ ] Servidor cerrado completamente (Ctrl+C)
- [ ] Procesos Node matados (`taskkill /F /IM node.exe`)
- [ ] Cache limpiado (`.next` eliminado)
- [ ] `.env` tiene `USE_OLLAMA=false`
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Logs muestran "Búsqueda semántica iniciando"
- [ ] Logs muestran "Usando Groq"

---

## 🎯 RESULTADO ESPERADO

Cuando funcione correctamente:

```
Cliente: "Me interesa el curso de piano"
         ↓
[Logs en 2 segundos]
🧠 Búsqueda semántica...
🚀 Usando Groq...
✅ Respuesta recibida
💡 Razón: Cliente busca curso de piano
📤 Enviando respuesta...
         ↓
Bot responde con CARD + AIDA
```

---

## 💡 SI AÚN NO FUNCIONA

1. **Verificar que el archivo existe**:
```bash
dir src\lib\semantic-product-search.ts
```

2. **Verificar imports**:
```bash
findstr /C:"semantic-product-search" src\conversational-module\ai\conversacionController.ts
```

3. **Ver errores de compilación**:
```bash
npm run build
```

---

**Próxima acción**: Ejecutar `REINICIAR_LIMPIO.bat`

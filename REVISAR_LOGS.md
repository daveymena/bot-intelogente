# 📋 CÓMO REVISAR LOS LOGS

## 🔍 Logs que Debes Buscar

Cuando envíes "Me interesa un portátil", busca estos logs en la consola:

### ✅ LOGS CORRECTOS (Si funciona)

```
[Baileys] 📝 Mensaje recibido: "Me interesa un portátil"
[Baileys] 🧠 Procesando con sistema híbrido...
[Hybrid] 🔄 Procesando con sistema híbrido...
[Hybrid] 🧠 Intención: product_search
[Hybrid] 🎯 Debe calificar primero antes de mostrar productos  ← DEBE APARECER
[Hybrid] 🎯 Calificando necesidades del cliente...
```

### ❌ LOGS INCORRECTOS (Si NO funciona)

```
[Baileys] 📝 Mensaje recibido: "Me interesa un portátil"
[Baileys] 🧠 Procesando con sistema híbrido...
[Hybrid] 🔄 Procesando con sistema híbrido...
[Hybrid] 🧠 Intención: product_search
[Hybrid] 📦 Productos encontrados: 1  ← SALTA DIRECTO A BUSCAR
```

## 🎯 Qué Buscar Específicamente

### 1. ¿Aparece "Debe calificar primero"?
```
[Hybrid] 🎯 Debe calificar primero antes de mostrar productos
```
- ✅ SI aparece → Sistema funcionando
- ❌ NO aparece → `shouldQualifyFirst()` no se ejecuta

### 2. ¿Cuántos productos encuentra?
```
[Hybrid] 📦 Productos encontrados: X
```
- ✅ 0 productos → Correcto (no buscó aún)
- ❌ 1+ productos → Incorrecto (buscó sin calificar)

### 3. ¿Qué responde el bot?
```
✅ CORRECTO:
"¡Perfecto! 💻 ¿Para qué lo vas a usar principalmente?
 1️⃣ Trabajo y estudio
 2️⃣ Gaming
 3️⃣ Diseño gráfico
 4️⃣ Uso básico"

❌ INCORRECTO:
[Envía productos o mouse]
```

## 📊 Secuencia Completa Esperada

```
1. [Baileys] 📝 Mensaje recibido: "Me interesa un portátil"
2. [Baileys] 🧠 Procesando con sistema híbrido...
3. [Hybrid] 🔄 Procesando con sistema híbrido...
4. [Hybrid] 🧠 Intención: product_search
5. [Hybrid] 🎯 Debe calificar primero antes de mostrar productos
6. [Hybrid] 🎯 Calificando necesidades del cliente...
7. [Baileys] ✅ Respuesta enviada
```

## 🐛 Si NO Funciona

### Problema 1: No aparece "Debe calificar primero"

**Causa:** `shouldQualifyFirst()` retorna false

**Verificar:**
```typescript
// En hybrid-intelligent-response-system.ts
console.log('🔍 Mensaje:', message)
console.log('🔍 Intent type:', intent.type)
console.log('🔍 Should qualify:', this.shouldQualifyFirst(message, intent))
```

### Problema 2: Busca productos inmediatamente

**Causa:** Salta la calificación

**Verificar:**
```typescript
// Agregar log antes de buscar
console.log('🔍 Antes de buscar productos')
console.log('🔍 Intent:', intent.type)
```

### Problema 3: Envía mouse en lugar de portátiles

**Causa:** Búsqueda rota

**Verificar:**
```bash
npx tsx scripts/test-busqueda-portatil.ts
```

## 💡 Comandos Útiles

### Ver logs en tiempo real
```bash
npm run dev
```

### Filtrar solo logs del sistema híbrido
```bash
npm run dev | findstr "Hybrid"
```

### Filtrar logs de calificación
```bash
npm run dev | findstr "calificar"
```

## 📝 Qué Reportar

Si no funciona, copia y pega:

1. **Los logs completos** desde que envías el mensaje
2. **La respuesta del bot**
3. **Si aparece o no** "Debe calificar primero"
4. **Cuántos productos** dice que encontró

Ejemplo:
```
Envié: "Me interesa un portátil"

Logs:
[Baileys] 📝 Mensaje recibido: "Me interesa un portátil"
[Hybrid] 🔄 Procesando con sistema híbrido...
[Hybrid] 🧠 Intención: product_search
[Hybrid] 📦 Productos encontrados: 1

Respuesta:
[Envió mouse]

❌ NO apareció "Debe calificar primero"
```

## ✅ Si Funciona

Deberías ver:
```
[Hybrid] 🎯 Debe calificar primero antes de mostrar productos
[Hybrid] 🎯 Calificando necesidades del cliente...
```

Y el bot debe responder:
```
¡Perfecto! 💻 ¿Para qué lo vas a usar principalmente?
1️⃣ Trabajo y estudio
2️⃣ Gaming
3️⃣ Diseño gráfico
4️⃣ Uso básico
```

---

**Reinicia el bot y prueba:**
```bash
npm run dev
```

Luego envía: "Me interesa un portátil"

Y revisa los logs! 🔍

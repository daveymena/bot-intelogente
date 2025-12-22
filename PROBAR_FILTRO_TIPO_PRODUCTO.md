# 🧪 Probar Filtro de Tipo de Producto

## ✅ Cambio Implementado

Ahora el bot detecta automáticamente si el usuario busca:
- 🖥️ **Producto Físico** (laptop, moto, celular, etc.)
- 📚 **Producto Digital** (curso, megapack, ebook, etc.)

## 🎯 Casos de Prueba

### Caso 1: "Busco uno para diseñar"

**Antes** ❌:
- Portátiles para diseño ✅
- Mega Pack de cursos de diseño ❌ (confusión)

**Ahora** ✅:
- Portátiles para diseño ✅
- NO muestra cursos ✅

**Detección**:
```
🎯 Detectado: PRODUCTO FÍSICO
Razón: "uno para" indica producto físico
Confianza: 85%
```

### Caso 2: "Quiero un curso de diseño"

**Antes** ❌:
- Cursos de diseño ✅
- Portátiles para diseño ❌ (confusión)

**Ahora** ✅:
- Cursos de diseño ✅
- NO muestra portátiles ✅

**Detección**:
```
🎯 Detectado: PRODUCTO DIGITAL
Razón: "curso de" indica producto digital
Confianza: 90%
```

### Caso 3: "Portátil para diseño"

**Detección**:
```
🎯 Detectado: PRODUCTO FÍSICO
Razón: "portátil" + especificaciones
Confianza: 95%
```

**Resultado**: Solo muestra laptops

### Caso 4: "Mega Pack de diseño"

**Detección**:
```
🎯 Detectado: PRODUCTO DIGITAL
Razón: "mega pack" indica producto digital
Confianza: 95%
```

**Resultado**: Solo muestra megapacks

## 🔍 Cómo Funciona

### 1. Detección de Indicadores

```typescript
// Indicadores FÍSICOS
- portátil, laptop, computador, pc
- moto, celular, tablet
- mouse, teclado, monitor
- "uno para", "busco uno"
- especificaciones: ram, gb, intel, amd

// Indicadores DIGITALES
- curso, cursos, aprender
- megapack, pack, colección
- ebook, pdf, video
- google drive, descarga
```

### 2. Scoring

```typescript
Query: "Busco uno para diseñar"

Físico: 5 puntos ("uno para")
Digital: 0 puntos

Resultado: FÍSICO (confianza: 100%)
```

### 3. Filtrado

```typescript
// Solo muestra productos del tipo detectado
if (typeIntent.confidence >= 0.6) {
  filteredProducts = filterByType(products, typeIntent)
}
```

## 🚀 Probar Ahora

### 1. Reiniciar el servidor

```bash
# Detener el servidor actual
# Luego iniciar de nuevo
npm run dev
```

### 2. Enviar mensaje de prueba

```
Usuario: "Busco uno para diseñar"
```

### 3. Verificar logs

Deberías ver en la consola:
```
🎯 [Type Detector] "uno para..." detectado → Producto FÍSICO
🎯 [Type Detector] Resultado: PHYSICAL (confianza: 85%)
🎯 [Type Detector] Filtrados 3/68 productos (tipo: PHYSICAL)
```

### 4. Verificar respuesta

El bot debería mostrar **SOLO portátiles**, sin cursos.

## 📊 Indicadores de Éxito

✅ Usuario busca "uno para diseñar" → Solo portátiles
✅ Usuario busca "curso de diseño" → Solo cursos
✅ Usuario busca "portátil gaming" → Solo laptops
✅ Usuario busca "mega pack" → Solo megapacks

## 🐛 Si No Funciona

### Verificar logs

```bash
# Buscar en la consola:
🎯 [Type Detector]
```

Si no aparece, el detector no se está ejecutando.

### Verificar confianza

Si la confianza es < 60%, no filtra:
```
🎯 [Type Detector] Resultado: UNKNOWN (confianza: 50%)
```

En este caso, ajustar los indicadores en `product-type-detector.ts`

## 🎓 Próximos Pasos

1. ✅ Probar con casos reales
2. ✅ Ajustar indicadores si es necesario
3. ✅ Agregar más reglas especiales
4. ✅ Integrar con categorización inteligente

## 📝 Notas

- El filtro solo se aplica si la confianza es >= 60%
- Si no está seguro, muestra todos los productos
- Los logs ayudan a debuggear la detección

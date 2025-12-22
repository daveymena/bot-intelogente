# Probar Curso de Piano en WhatsApp

## 🔧 Cambios Aplicados

1. ✅ Agregados métodos `canHandleLocally()` y `handleLocally()` al SearchAgent
2. ✅ Mejorada extracción de keywords (agregado "estoy", "me", "te", etc. a ignorar)
3. ✅ Agregados logs detallados para debugging

## 🧪 Cómo Probar

### 1. Reiniciar el servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar
npm run dev
```

### 2. Enviar mensaje en WhatsApp

```
Estoy interesado en el curso de piano
```

### 3. Verificar en los logs

Deberías ver algo como:

```
[SearchAgent] 🔍 Iniciando búsqueda con razonamiento contextual
🧠 [CONTEXTUAL BRAIN] Iniciando razonamiento...
✅ [BRAIN] Producto específico detectado en mensaje
🎯 [BRAIN] Búsqueda ESPECÍFICA detectada
[SearchAgent] 🔑 Keywords extraídas: curso, piano
[SearchAgent] 📦 Encontrados X productos candidatos en BD
[SearchAgent] 🎯 Top 5 productos con score:
   1. Curso Completo de Piano Online (score: 20, matched: 2/2)
   ...
```

## 🎯 Resultado Esperado

El bot debe responder con:

```
¡Hola! Te muestro el curso de piano:

📦 Curso Completo de Piano Online
💻 Aprende piano desde cero...
💰 60.000 COP

¿Te interesa este curso?
```

## ❌ Si Sigue Mostrando Megapacks

Verifica en los logs:

1. **Keywords extraídas**: Deben ser `curso, piano`
2. **Productos encontrados**: Debe incluir el curso de piano
3. **Score**: El curso de piano debe tener el score más alto
4. **SearchType**: Debe ser `specific`

## 🔍 Debugging

Si el problema persiste, revisa:

### 1. Base de Datos
```bash
npx tsx scripts/verificar-productos-bd.ts
```

Verifica que existe un producto con:
- Nombre que contenga "piano"
- Status: AVAILABLE
- Categoría: DIGITAL

### 2. Logs del ContextualBrain

Busca en los logs:
```
🧠 [CONTEXTUAL BRAIN] Iniciando razonamiento...
```

Debe mostrar:
- Tipo: `new_search`
- SearchType: `specific`
- Query: "estoy interesado en el curso de piano"

### 3. Logs del SearchAgent

Busca:
```
[SearchAgent] 🔑 Keywords extraídas: ...
```

Debe mostrar: `curso, piano` (sin "estoy", "interesado", "en", "el", "de")

## 🚨 Problemas Comunes

### Problema 1: Cae en sistema híbrido
```
❌ Error en agente, usando sistema híbrido como fallback
```

**Solución**: Ya corregido con los métodos `canHandleLocally()` y `handleLocally()`

### Problema 2: Keywords incorrectas
```
[SearchAgent] 🔑 Keywords extraídas: estoy, interesado, curso, piano
```

**Solución**: Ya corregido agregando más palabras a `ignoreWords`

### Problema 3: No encuentra el producto
```
[SearchAgent] 📦 Encontrados 0 productos candidatos en BD
```

**Solución**: Verificar que el producto existe en la BD con status AVAILABLE

## 📝 Notas

- El sistema ahora tiene logs detallados para debugging
- Los keywords se extraen correctamente
- El ContextualBrain detecta búsquedas específicas
- El SearchAgent busca con scoring inteligente

## ✅ Checklist

- [ ] Servidor reiniciado
- [ ] Mensaje enviado en WhatsApp
- [ ] Logs revisados
- [ ] Respuesta correcta recibida
- [ ] Curso de piano mostrado (NO megapacks)

---

**Última actualización**: 22 de Noviembre de 2025

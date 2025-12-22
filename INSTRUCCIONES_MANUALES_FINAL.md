# ⚡ INSTRUCCIONES FINALES - Comentar Escalamiento

## 🎯 Problema

El bot cae al fallback de IA porque hay un error en línea 474.

## ✅ Solución Manual (2 minutos)

### Paso 1: Abrir archivo
`src/lib/baileys-stable-service.ts`

### Paso 2: Buscar línea 470
Busca este texto:
```
// ? GVERIFICAR SI NECESITA ESCALAMIENTO A HUMANO
```

### Paso 3: Seleccionar TODO el bloque
Desde línea 470 hasta línea 503 (donde dice `continue // No enviar respuesta automática`)

### Paso 4: Comentar con /* */
Envuelve todo el bloque en un comentario:
```typescript
/*
// ? GVERIFICAR SI NECESITA ESCALAMIENTO A HUMANO
console.log('[Baileys] 🔍 Verificando si necesita escalamiento...')
... TODO EL BLOQUE ...
continue // No enviar respuesta automática
}
*/
```

O simplemente ELIMINA todo el bloque (líneas 470-503)

### Paso 5: Guardar y reiniciar
```bash
npm run dev
```

## 📊 Resultado

El bot dejará de caer al fallback de IA y usará plantillas locales (sin gastar tokens).

---

**Tiempo:** 2 minutos  
**Prioridad:** CRÍTICA

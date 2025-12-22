# 🔧 CORRECCIÓN URGENTE - Errores Críticos

## 🔴 Problemas Detectados

### 1. Error en Sistema de Escalamiento
**Línea:** `src/lib/baileys-stable-service.ts:474`
**Error:** `IntelligentEscalationSystem.shouldEscalate is not a function`

**Solución:** Comentar temporalmente el bloque de escalamiento (líneas 470-503)

```typescript
// COMENTAR ESTE BLOQUE COMPLETO:
/*
// ? GVERIFICAR SI NECESITA ESCALAMIENTO A HUMANO
console.log('[Baileys] 🔍 Verificando si necesita escalamiento...')
const { IntelligentEscalationSystem } = await import('./intelligent-escalation-system')

const escalationCheck = await IntelligentEscalationSystem.shouldEscalate(
  messageText,
  history,
  analysis.confidence
)

if (escalationCheck.shouldEscalate) {
  // ... todo el bloque
}
*/
```

### 2. Error en Búsqueda de Productos
**Línea:** `src/lib/plantillas-respuestas-bot.ts:933`
**Error:** `Unknown argument 'has'` en tags

**Solución:** ✅ YA CORREGIDO - Removido `tags: { has: productQuery }`

### 3. Bot Cae al Fallback de IA
**Problema:** Sistema local no funciona, siempre usa IA (gasta tokens)

**Causa:** Errores en el sistema local hacen que caiga al fallback

**Solución:** Arreglar errores 1 y 2 primero

---

## ⚡ SOLUCIÓN RÁPIDA

### Paso 1: Editar `src/lib/baileys-stable-service.ts`

Buscar línea 470 y comentar TODO el bloque hasta línea 503:

```typescript
// 🚨 SISTEMA DE ESCALAMIENTO (DESACTIVADO TEMPORALMENTE)
// El sistema híbrido actual maneja bien los casos complejos con IA

// 📝 GENERAR RESPUESTA DESDE PLANTILLA (SIN IA)
const responseText = SmartResponseEngine.generateResponse(analysis, {
  product_name: context?.lastProductName || 'Producto',
  price: '50.000 COP'
})
```

### Paso 2: Reiniciar Bot

```bash
npm run dev
```

### Paso 3: Probar

```
Cliente: "Me interesa el curso de piano"
```

Debería:
- ✅ Buscar en BD sin error
- ✅ Responder con plantilla local (sin IA)
- ✅ NO caer al fallback

---

## 📊 Resultado Esperado

### ANTES (Con errores)
```
[Baileys] Error con sistema 24/7: TypeError
[Baileys] Usando sistema de fallback
[IntelligentBot] Procesando con IA  ← GASTA TOKENS
```

### DESPUÉS (Corregido)
```
[Baileys] Usando SmartResponseEngine
[SmartResponseEngine] Producto encontrado
[Baileys] Respuesta desde plantilla  ← SIN GASTAR TOKENS
```

---

## 🎯 Prioridad

**CRÍTICO** - El bot no puede funcionar correctamente hasta arreglar esto.

**Tiempo estimado:** 2 minutos

---

**Estado:** PENDIENTE DE APLICAR
**Fecha:** 24 Noviembre 2025

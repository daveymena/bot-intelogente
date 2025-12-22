# 📋 PLAN PARA PRÓXIMA SESIÓN

## 🎯 Objetivo Principal

**Restaurar el sistema funcional y mejorar SOLO lo que está fallando, sin cambiar lo que ya funciona.**

## ✅ Principios a Seguir

1. **NO tocar lo que funciona**
2. **Corregir SOLO los errores específicos**
3. **Mantener el sistema original intacto**
4. **Cambios mínimos y quirúrgicos**

## 🔍 Problemas Específicos a Corregir

### 1. Modelo Groq Deprecado (CRÍTICO)
**Síntoma:** Error 400 - modelo decommissioned
**Solución:** Cambiar `llama-3.1-70b-versatile` → `llama-3.3-70b-versatile`
**Archivos:** Solo donde aparezca el modelo viejo
**Impacto:** Mínimo, solo actualizar versión

### 2. Bot Inventa Información
**Síntoma:** Dice "curso de inglés" en lugar de "Mega Pack 08: Cursos Idiomas"
**Causa:** System prompt no instruye usar nombre exacto de BD
**Solución:** Agregar instrucción en system prompt: "Usa el nombre EXACTO del producto de la base de datos"
**Archivos:** Solo el system prompt en ai-service.ts
**Impacto:** Mínimo, solo agregar una línea

### 3. SmartEnhancer Envía Foto Incorrecta
**Síntoma:** Hablan de inglés, envía foto de Marketing Digital
**Causa:** Detección de producto en respuesta es incorrecta
**Solución:** Mejorar detección para usar contexto guardado
**Archivos:** smart-product-response-enhancer.ts
**Impacto:** Pequeño, solo mejorar lógica de detección

## ❌ Lo que NO Vamos a Tocar

- ✅ Sistema de razonamiento (reasoning-service.ts)
- ✅ Formato con emojis y cards (response-formatter.ts)
- ✅ Sistema híbrido (smart-ai-router.ts)
- ✅ Flujos de ventas (sales-flow-service.ts)
- ✅ Sistema de entrenamiento
- ✅ Base de conocimiento
- ✅ Cualquier cosa que ya funcione

## 📝 Checklist de Correcciones

### Corrección 1: Actualizar Modelo Groq
```typescript
// ANTES
model: 'llama-3.1-70b-versatile'

// DESPUÉS
model: 'llama-3.3-70b-versatile'
```
**Archivos a revisar:**
- [ ] src/lib/intelligent-payment-detector.ts
- [ ] Buscar otros archivos con grep

### Corrección 2: System Prompt - Usar Nombre Exacto
```typescript
// AGREGAR al system prompt:
"⚠️ IMPORTANTE: 
- Usa el NOMBRE EXACTO del producto que aparece arriba
- NO digas 'curso de inglés', di 'Mega Pack 08: Cursos Idiomas'
- Usa el PRECIO EXACTO que aparece arriba
- NO inventes información"
```
**Archivo:** src/lib/ai-service.ts (solo agregar líneas)

### Corrección 3: SmartEnhancer - Usar Contexto
```typescript
// Mejorar detección para:
1. Primero buscar en ProductContextManager
2. Si hay contexto, usar ese producto
3. Solo si no hay contexto, buscar en respuesta
```
**Archivo:** src/lib/smart-product-response-enhancer.ts

## 🧪 Pruebas de Validación

Después de cada corrección, probar:

```
Test 1: Búsqueda de Producto
Cliente: "Hola, curso de inglés?"
Esperado: 
- Encuentra Mega Pack 08
- Dice "Mega Pack 08: Cursos Idiomas" (nombre exacto)
- Envía foto del Mega Pack 08
✅ PASS / ❌ FAIL

Test 2: Mantener Contexto
Cliente: "Más información"
Esperado:
- Mantiene Mega Pack 08
- No cambia a otro producto
✅ PASS / ❌ FAIL

Test 3: Solicitud de Pago
Cliente: "Dame el link de pago"
Esperado:
- Genera enlaces del Mega Pack 08
- No pregunta qué producto
✅ PASS / ❌ FAIL
```

## 📊 Metodología

1. **Leer primero** - Revisar archivos antes de cambiar
2. **Cambio mínimo** - Solo lo necesario
3. **Probar inmediatamente** - Validar cada cambio
4. **Rollback si falla** - Volver atrás si rompe algo

## 🎯 Resultado Esperado

Al final de la sesión:
- ✅ Modelo Groq actualizado y funcionando
- ✅ Bot usa nombres exactos de productos
- ✅ SmartEnhancer envía fotos correctas
- ✅ Todo lo demás sigue funcionando igual
- ✅ Sistema restaurado y mejorado

## 📚 Documentos de Referencia

Para entender el sistema original:
- SISTEMA_FUNCIONANDO_CORRECTAMENTE.md
- SISTEMA_HIBRIDO_INTELIGENTE_FINAL.md
- FOTOS_AUTOMATICAS_COMO_CARDS.md
- SISTEMA_IA_RAZONAMIENTO_COMPLETO.md

## ⚠️ Reglas Estrictas

1. **NO agregar nuevas funcionalidades**
2. **NO cambiar arquitectura**
3. **NO mover código entre archivos**
4. **NO refactorizar "por si acaso"**
5. **SOLO corregir los 3 problemas específicos**

## 🚀 Inicio de Próxima Sesión

Comenzar con:
```
"Voy a corregir SOLO los 3 problemas específicos sin tocar nada más:
1. Actualizar modelo Groq
2. Agregar instrucción de nombre exacto
3. Mejorar detección de SmartEnhancer

¿Empezamos?"
```

---

**Fecha:** Noviembre 2025
**Objetivo:** Restauración quirúrgica, no reconstrucción
**Filosofía:** "Si no está roto, no lo toques"

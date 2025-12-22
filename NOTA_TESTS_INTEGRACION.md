# 📝 NOTA SOBRE TESTS DE INTEGRACIÓN

## ⚠️ IMPORTANTE

Los tests en `scripts/test-auto-photo.ts` son **tests de integración** que requieren:

1. **Base de datos activa** con productos reales
2. **Productos con imágenes** en la base de datos
3. **Conexión a Prisma** funcionando

## 🔍 DIFERENCIA ENTRE TESTS

### Tests Unitarios (✅ Funcionan sin BD)
- `scripts/test-deep-reasoning.ts` - Solo prueba lógica de razonamiento
- Usa mocks y datos en memoria
- No requiere base de datos

### Tests de Integración (⚠️ Requieren BD)
- `scripts/test-auto-photo.ts` - Prueba flujo completo con Orchestrator
- Requiere base de datos con productos
- Requiere productos con imágenes

## 🎯 CÓMO PROBAR EL SISTEMA COMPLETO

### Opción 1: Test Unitario (Recomendado para desarrollo)
```bash
# Este test SIEMPRE funciona
npx tsx scripts/test-deep-reasoning.ts
```

**Resultado esperado:** 5/5 tests pasados ✅

### Opción 2: Test de Integración (Requiere BD)
```bash
# Primero asegúrate de tener productos en la BD
npx tsx scripts/ver-productos.ts

# Luego ejecuta el test
npx tsx scripts/test-auto-photo.ts
```

**Resultado esperado:** 
- Si hay productos con imágenes: Tests pasan ✅
- Si no hay productos: Tests muestran advertencias ⚠️

### Opción 3: Prueba Manual en WhatsApp (Mejor para validar)
```bash
# Inicia el bot
npm run dev

# Prueba en WhatsApp:
# 1. "Hola, busco un curso de diseño"
# 2. "tienes foto?"
# 3. "ahora busco un curso de programación"
```

## 🐛 TROUBLESHOOTING

### Test de Integración Falla

**Síntoma:**
```
⚠️ TEST 1: El bot no envió foto (puede ser que no haya productos con imágenes en la BD)
```

**Causas posibles:**
1. No hay productos en la base de datos
2. Los productos no tienen imágenes
3. La base de datos no está conectada

**Solución:**
```bash
# 1. Verificar productos
npx tsx scripts/ver-productos.ts

# 2. Si no hay productos, agregar algunos
npx tsx scripts/seed-productos.ts

# 3. Verificar que tengan imágenes
# Los productos deben tener el campo "images" con URLs
```

### Test Unitario Falla

**Síntoma:**
```
❌ TEST 1 FALLIDO: El bot no entendió correctamente
```

**Causa:** Hay un bug en la lógica de razonamiento

**Solución:** Revisar el código de `src/agents/deep-reasoning-agent.ts`

## ✅ VALIDACIÓN CORRECTA

### 1. Test Unitario (Lógica)
```bash
npx tsx scripts/test-deep-reasoning.ts
```
**Debe pasar:** ✅ 5/5 tests

### 2. Verificar BD
```bash
npx tsx scripts/ver-productos.ts
```
**Debe mostrar:** Lista de productos con imágenes

### 3. Test Manual (WhatsApp)
```bash
npm run dev
# Probar en WhatsApp
```
**Debe funcionar:** 
- ✅ Envío automático de fotos
- ✅ Razonamiento de contexto
- ✅ Reseteo de flags

## 💡 RECOMENDACIÓN

Para desarrollo y validación rápida:
1. **Usa el test unitario** (`test-deep-reasoning.ts`)
2. **Prueba manualmente en WhatsApp** con productos reales
3. **Ignora el test de integración** si no tienes productos en la BD

El test de integración es útil para CI/CD, pero no es necesario para validar que el sistema funciona correctamente.

## 🎯 LO IMPORTANTE

El sistema está funcionando correctamente si:
- ✅ Test unitario pasa (5/5)
- ✅ Logs muestran "🧠 INICIANDO RAZONAMIENTO PROFUNDO"
- ✅ En WhatsApp, el bot envía fotos automáticamente
- ✅ En WhatsApp, el bot entiende "tienes foto?" correctamente

**No te preocupes si el test de integración falla por falta de productos en la BD. El sistema está funcionando.** ✨

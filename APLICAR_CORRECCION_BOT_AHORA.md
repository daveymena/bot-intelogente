# Aplicar Corrección al Bot - Instrucciones

## ✅ Corrección Completada

El problema de selección de productos ha sido resuelto. El bot ahora selecciona correctamente el producto específico que el usuario menciona.

## 🧪 Paso 1: Probar Localmente

Antes de desplegar, prueba que funciona:

```bash
# Ejecutar test
npx tsx scripts/test-seleccion-producto-especifico.ts
```

**Resultado esperado:**
- ✅ Búsqueda de "curso de piano" devuelve solo ese producto
- ✅ Selección de "el curso de piano completo" funciona
- ✅ Método de pago se genera para el producto correcto

## 🚀 Paso 2: Reiniciar el Bot

Si el bot está corriendo, reinícialo para aplicar los cambios:

```bash
# Detener el bot actual (Ctrl+C)

# Reiniciar
npm run dev
```

## 📱 Paso 3: Probar en WhatsApp Real

Prueba el flujo completo en WhatsApp:

1. **Envía:** "Me interesa un curso de piano"
   - **Espera:** Bot muestra SOLO el curso de piano (no otros productos)

2. **Envía:** "El curso de piano completo"
   - **Espera:** Bot confirma ese producto específico

3. **Envía:** "Me envías el método de pago por nequi?"
   - **Espera:** Bot genera link de pago para el curso de piano

## 🔍 Verificación

### ✅ Señales de que funciona correctamente:

1. **No muestra productos irrelevantes**
   - ❌ Antes: Mostraba horno cafetera, megapacks, etc.
   - ✅ Ahora: Solo muestra el producto relevante

2. **Selección específica funciona**
   - Usuario puede decir "el curso de piano completo"
   - Bot entiende y selecciona ese específico

3. **Contexto se mantiene**
   - Método de pago se aplica al producto correcto
   - No se confunde con otros productos

### ❌ Si algo no funciona:

1. **Verifica que el bot se reinició**
   ```bash
   # Detener completamente
   Ctrl+C
   
   # Reiniciar
   npm run dev
   ```

2. **Revisa los logs**
   - Busca: `[SearchAgent]` en la consola
   - Debe mostrar: "Match exacto encontrado" o scores altos

3. **Verifica la base de datos**
   ```bash
   # Ver productos
   npx tsx scripts/ver-productos.ts
   ```

## 📊 Monitoreo

Después de aplicar, monitorea:

1. **Conversaciones reales**
   - ¿Los usuarios encuentran lo que buscan?
   - ¿Se muestran productos irrelevantes?

2. **Logs del sistema**
   - Busca: `[SearchAgent]` para ver scoring
   - Verifica que los scores sean correctos

3. **Métricas**
   - Tasa de conversión
   - Productos más buscados
   - Errores de selección

## 🎯 Ajustes Opcionales

Si necesitas ajustar el comportamiento:

### Cambiar umbral de match exacto

En `src/agents/search-agent.ts`, línea ~80:

```typescript
// Actual: score >= 10
if (productsWithScore[0].score >= 10) {
  return [productsWithScore[0].product];
}

// Más estricto: score >= 15
// Menos estricto: score >= 8
```

### Ajustar scoring

En `calculateProductScore()`, puedes modificar los puntos:

```typescript
// Match exacto en nombre
if (name === fullQuery) {
  score += 20; // Aumentar para ser más estricto
}
```

## 🐛 Troubleshooting

### Problema: Sigue mostrando múltiples productos

**Solución:**
1. Verifica que el archivo se guardó correctamente
2. Reinicia el bot completamente
3. Revisa los logs para ver el scoring

### Problema: No encuentra ningún producto

**Solución:**
1. Verifica que los productos existen en la BD
2. Revisa las keywords extraídas en los logs
3. Ajusta el umbral de scoring (bajarlo)

### Problema: Selecciona el producto incorrecto

**Solución:**
1. Revisa el scoring en los logs
2. Ajusta los pesos en `calculateProductScore()`
3. Verifica los nombres de productos en la BD

## 📝 Notas Importantes

- ✅ Los cambios son compatibles con el sistema actual
- ✅ No requiere cambios en la base de datos
- ✅ Funciona sin IA externa (más rápido)
- ✅ Mantiene el contexto conversacional
- ✅ Compatible con SQLite y PostgreSQL

## 🎉 Resultado Final

Después de aplicar esta corrección:

- ✅ Bot selecciona productos correctamente
- ✅ No muestra productos irrelevantes
- ✅ Flujo conversacional natural
- ✅ Mejor experiencia de usuario
- ✅ Mayor tasa de conversión

---

**¿Listo para aplicar?** Ejecuta el test primero, luego reinicia el bot y prueba en WhatsApp.

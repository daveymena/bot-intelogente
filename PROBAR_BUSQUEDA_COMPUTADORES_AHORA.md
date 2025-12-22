# 🧪 Probar Búsqueda de Computadores - AHORA

## ✅ Corrección Aplicada

El sistema de búsqueda ha sido corregido con:
- Búsqueda semántica con expansión de keywords
- Sistema de ranking inteligente
- Fallback local cuando la IA falla

## 🚀 Cómo Probar

### Opción 1: Prueba Rápida (Sin IA)

```bash
npx tsx scripts/test-busqueda-local.ts
```

**Resultado esperado:**
- Top 10 productos son todos portátiles Asus/Acer
- Score: 130 para portátiles principales
- Accesorios quedan fuera del top 4

### Opción 2: Prueba Completa (Con IA)

```bash
npx tsx scripts/test-busqueda-computadores.ts
```

**Nota:** Puede fallar por rate limit de Groq, pero el fallback local funcionará.

### Opción 3: Probar con WhatsApp Real

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Conectar WhatsApp** (si no está conectado):
   - Ir a: http://localhost:3000
   - Escanear QR code

3. **Enviar mensajes de prueba:**
   ```
   Hola, tienes computadores?
   Quiero ver portátiles
   Necesito un laptop
   Que opciones de computadores tienes?
   Muéstrame los portátiles disponibles
   Tienes laptops para trabajo?
   ```

4. **Verificar respuesta:**
   - ✅ Debe mostrar portátiles Asus/Acer
   - ✅ NO debe mostrar cursos ni megapacks
   - ✅ Puede incluir algunos accesorios (bases, protectores) pero los portátiles deben estar primero

## 📊 Logs a Monitorear

En la consola del servidor, buscar:

```
🔑 Keywords expandidas: [ 'computador', 'portátil', 'portatil', 'laptop', 'notebook' ]
🔍 Búsqueda semántica activada
📦 Productos encontrados (antes de ranking): 15
   Top 4 después de ranking: [
     'Portátil Asus Vivobook 16...',
     'Portátil Asus Vivobook 15...',
     ...
   ]
```

## ✅ Criterios de Éxito

La corrección funciona si:
- ✅ Muestra portátiles reales (Asus, Acer, etc.)
- ✅ NO muestra cursos ni megapacks
- ✅ Los portátiles aparecen primero (antes que accesorios)
- ✅ Funciona con y sin IA (fallback local)

## 🐛 Si Algo Falla

### Error: "No encontré productos"
- Verificar que hay productos en la BD: `npx tsx scripts/debug-productos-categoria.ts`
- Verificar userId correcto en scripts de prueba

### Error: Rate limit de Groq
- Normal, el fallback local se activará automáticamente
- Esperar 3-4 minutos o usar prueba local sin IA

### Muestra productos incorrectos
- Verificar logs de ranking
- Ejecutar: `npx tsx scripts/test-busqueda-local.ts`
- Revisar scores de productos

## 📝 Archivos Clave

- **Lógica principal:** `src/lib/intelligent-product-query-system.ts`
- **Prueba local:** `scripts/test-busqueda-local.ts`
- **Prueba con IA:** `scripts/test-busqueda-computadores.ts`
- **Diagnóstico:** `scripts/debug-productos-categoria.ts`

## 🎯 Siguiente Paso

**PROBAR AHORA:**

```bash
# Prueba rápida (recomendado)
npx tsx scripts/test-busqueda-local.ts

# O iniciar servidor y probar con WhatsApp
npm run dev
```

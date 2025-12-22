# Diagnóstico: Búsqueda de Productos

## 🔍 Problema Detectado

El test no encuentra productos porque está usando un `userId` de prueba que no existe en la base de datos.

## ✅ Solución

Los tests ahora obtienen el `userId` real de la base de datos automáticamente.

## 🧪 Pasos para Diagnosticar

### 1. Verificar que hay productos en la BD

```bash
npx tsx scripts/ver-productos.ts
```

**Resultado esperado:**
- Debe mostrar productos
- Debe incluir "Curso Completo de Piano"
- Debe incluir varios "Mega Pack"

### 2. Ejecutar test de búsqueda simple

```bash
npx tsx scripts/test-busqueda-simple.ts
```

O ejecutar: `PROBAR_BUSQUEDA_SIMPLE.bat`

**Este test verifica:**
- ✅ Que se puede conectar a la BD
- ✅ Que hay un usuario
- ✅ Que hay productos asociados al usuario
- ✅ Que la búsqueda de "piano" funciona
- ✅ Que la búsqueda de "curso" funciona
- ✅ Que la búsqueda de "mega pack" funciona

### 3. Ejecutar test de curso vs megapack

```bash
npx tsx scripts/test-curso-piano-vs-megapack.ts
```

**Ahora debería:**
- ✅ Encontrar productos
- ✅ Usar el userId correcto
- ✅ Mostrar resultados reales

### 4. Ejecutar test de selección específica

```bash
npx tsx scripts/test-seleccion-producto-especifico.ts
```

## 🐛 Problemas Comunes

### Problema 1: "No se encontró ningún usuario"

**Causa:** No hay usuarios en la base de datos

**Solución:**
1. Inicia sesión en el dashboard: `npm run dev`
2. Abre http://localhost:3000
3. Crea una cuenta o inicia sesión
4. Vuelve a ejecutar el test

### Problema 2: "Total productos: 0"

**Causa:** No hay productos en la base de datos

**Solución:**
1. Importa productos desde el dashboard
2. O ejecuta: `npx tsx scripts/import-productos-completos.ts`
3. Verifica: `npx tsx scripts/ver-productos.ts`

### Problema 3: "No se encontró Curso Completo de Piano"

**Causa:** El producto no existe o tiene otro nombre

**Solución:**
1. Verifica el nombre exacto: `npx tsx scripts/ver-productos.ts`
2. Busca productos con "piano": `npx tsx scripts/test-busqueda-simple.ts`
3. Si no existe, impórtalo desde el dashboard

### Problema 4: Test encuentra 0 productos

**Causa:** El SearchAgent no está usando el userId correcto

**Solución:**
1. Verifica que los tests actualizados usan `db.user.findFirst()`
2. Revisa los logs del SearchAgent
3. Verifica que `memory.userId` sea correcto

## 📊 Verificación de Correcciones

### Antes de las correcciones:
```typescript
// ❌ userId hardcodeado
const userId = 'test-user';
```

### Después de las correcciones:
```typescript
// ✅ userId real de la BD
const user = await db.user.findFirst();
const userId = user.id;
```

## 🔧 Archivos Modificados

1. **`scripts/test-curso-piano-vs-megapack.ts`**
   - Ahora obtiene userId real
   - Verifica que el usuario existe
   - Muestra información del usuario

2. **`scripts/test-seleccion-producto-especifico.ts`**
   - Ahora obtiene userId real
   - Verifica que el usuario existe

3. **`scripts/test-busqueda-simple.ts`** (nuevo)
   - Test de diagnóstico
   - Verifica conexión a BD
   - Verifica búsquedas básicas

4. **`scripts/get-user-id.ts`** (nuevo)
   - Obtiene y muestra userId
   - Útil para debugging

## 🚀 Próximos Pasos

1. **Ejecutar test de búsqueda simple:**
   ```bash
   npx tsx scripts/test-busqueda-simple.ts
   ```

2. **Si pasa, ejecutar test de curso vs megapack:**
   ```bash
   npx tsx scripts/test-curso-piano-vs-megapack.ts
   ```

3. **Si pasa, ejecutar test de selección específica:**
   ```bash
   npx tsx scripts/test-seleccion-producto-especifico.ts
   ```

4. **Si todos pasan, probar en el bot real:**
   ```bash
   npm run dev
   ```

## 📝 Notas

- Los tests ahora son más robustos
- Usan datos reales de la BD
- Verifican que el usuario existe
- Muestran información útil para debugging
- Funcionan con cualquier usuario en la BD

## ✅ Checklist

- [ ] Hay un usuario en la BD
- [ ] Hay productos en la BD
- [ ] Existe "Curso Completo de Piano"
- [ ] Existen varios "Mega Pack"
- [ ] Test de búsqueda simple pasa
- [ ] Test de curso vs megapack pasa
- [ ] Test de selección específica pasa
- [ ] Bot funciona correctamente en WhatsApp

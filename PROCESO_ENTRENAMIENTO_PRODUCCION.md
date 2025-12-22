# 🚀 Proceso de Entrenamiento para Producción

## Estrategia Recomendada: Entrenar Local + Subir DB

### Paso 1: Entrenar Localmente (ANTES de subir a Git)

```bash
# 1. Asegúrate de estar en desarrollo
npm run db:dev

# 2. Ejecutar entrenamiento rápido (5-10 min)
npm run train:quick

# O entrenamiento completo (30-60 min)
npm run train:full

# 3. Verificar que funcionó
npm run train:test
```

**Resultado esperado:**
```
✅ Conversaciones exitosas: 38/40 (95%)
🧠 Respuestas guardadas: 120+
📈 Tasa de éxito sin IA: 85%+
```

### Paso 2: Exportar Base de Conocimiento

```bash
# Crear backup de la base de conocimiento
npx tsx scripts/exportar-conocimiento.ts
```

Esto crea: `knowledge-backup.json` con todas las respuestas entrenadas.

### Paso 3: Subir a Git

```bash
# Subir código + backup de conocimiento
git add .
git commit -m "feat: Sistema de entrenamiento completo + base de conocimiento"
git push origin main
```

### Paso 4: Importar en Producción (Easypanel)

Una vez desplegado en Easypanel:

```bash
# Conectar a la consola de Easypanel
# Ejecutar:
npm run knowledge:import

# O manualmente:
npx tsx scripts/importar-conocimiento.ts
```

## Opción Alternativa: Entrenamiento Automático en Producción

Si prefieres entrenar directamente en producción:

### Ventajas:
- ✅ Siempre actualizado con productos nuevos
- ✅ No necesitas exportar/importar

### Desventajas:
- ❌ Consume tokens de IA en producción
- ❌ Toma tiempo (30-60 min)
- ❌ Puede afectar rendimiento durante entrenamiento

### Implementación:

Agregar endpoint de administración:

```typescript
// src/app/api/admin/train/route.ts
export async function POST(request: Request) {
  // Verificar autenticación de admin
  const { authorization } = request.headers;
  
  if (authorization !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ejecutar entrenamiento en background
  trainInBackground();
  
  return Response.json({ 
    message: 'Entrenamiento iniciado',
    estimatedTime: '30-60 minutos'
  });
}
```

Luego desde el dashboard o con curl:

```bash
curl -X POST https://tu-app.easypanel.app/api/admin/train \
  -H "Authorization: Bearer TU_ADMIN_SECRET"
```

## Opción Híbrida: Entrenamiento Incremental (MEJOR)

Combina ambas estrategias:

### 1. Entrenamiento Base (Local)
- Entrenar localmente con todos los productos existentes
- Subir base de conocimiento a producción

### 2. Entrenamiento Incremental (Producción)
- Cuando agregas un producto nuevo, entrenar solo ese producto
- Automático o manual desde dashboard

### Implementación:

```typescript
// scripts/entrenar-producto-nuevo.ts
async function trainNewProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) return;

  // Entrenar solo este producto
  for (const flow of ESSENTIAL_FLOWS) {
    for (const method of PAYMENT_METHODS) {
      // Simular conversación
      // Guardar en base de conocimiento
    }
  }
}
```

Agregar al crear producto:

```typescript
// src/app/api/products/route.ts
export async function POST(request: Request) {
  // ... crear producto ...
  
  // Entrenar automáticamente en background
  trainNewProduct(newProduct.id).catch(console.error);
  
  return Response.json(newProduct);
}
```

## Recomendación Final

### Para tu caso (Easypanel):

**USAR OPCIÓN HÍBRIDA:**

1. **Ahora (antes de subir):**
   ```bash
   npm run train:full
   npm run knowledge:export
   git add . && git commit -m "feat: Base de conocimiento completa"
   git push
   ```

2. **En Easypanel (después de deploy):**
   ```bash
   npm run knowledge:import
   ```

3. **Para productos nuevos:**
   - Entrenar automáticamente al crear
   - O ejecutar `npm run train:quick` periódicamente

## Scripts Necesarios

Voy a crear los scripts de exportar/importar conocimiento...

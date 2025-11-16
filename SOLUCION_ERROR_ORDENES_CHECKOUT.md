# 🔧 Solución: Error al Crear Órdenes en Checkout

## ❌ Error

```
Error: Error al crear la orden
src\app\tienda\checkout\page.tsx (177:15) @ handleSubmit
```

La API `/api/orders/create` está retornando un error al intentar crear la orden en la base de datos.

## 🔍 Causa Probable

El modelo `Order` en Prisma no está sincronizado con la BD, o Prisma no está generado correctamente.

## ✅ Soluciones (En Orden)

### Solución 1: Generar Prisma Client
```bash
npx prisma generate
```

### Solución 2: Sincronizar BD con Schema
```bash
npx prisma db push
```

### Solución 3: Ejecutar Migraciones
```bash
npx prisma migrate dev
```

### Solución 4: Resetear BD (Si nada funciona)
```bash
npx prisma migrate reset
```

## 🧪 Verificar que Funciona

### Opción 1: Ejecutar Script de Diagnóstico
```bash
npx tsx scripts/diagnosticar-error-ordenes.ts
```

Este script:
- ✅ Verifica conexión a BD
- ✅ Verifica que la tabla "orders" existe
- ✅ Intenta crear una orden de prueba
- ✅ Limpia la orden de prueba
- ✅ Muestra si todo está OK

### Opción 2: Verificar Manualmente
```bash
# Abrir Prisma Studio
npx prisma studio

# Luego:
# 1. Ir a la tabla "orders"
# 2. Crear un registro de prueba
# 3. Si funciona, el problema está en la API
```

## 📋 Checklist de Verificación

- [ ] DATABASE_URL está configurado en `.env`
- [ ] La BD está corriendo
- [ ] Ejecutaste `npx prisma generate`
- [ ] Ejecutaste `npx prisma db push`
- [ ] La tabla "orders" existe en la BD
- [ ] El modelo Order está en `prisma/schema.prisma`

## 🚀 Pasos Rápidos para Arreglar

### Paso 1: Limpiar y Regenerar
```bash
# Eliminar node_modules de Prisma
rm -rf node_modules/.prisma

# Regenerar
npx prisma generate
```

### Paso 2: Sincronizar BD
```bash
npx prisma db push
```

### Paso 3: Probar
```bash
# Ejecutar script de diagnóstico
npx tsx scripts/diagnosticar-error-ordenes.ts
```

### Paso 4: Si Aún Falla
```bash
# Resetear todo
npx prisma migrate reset

# Luego probar de nuevo
npx tsx scripts/diagnosticar-error-ordenes.ts
```

## 📝 Código de la API

**Archivo**: `src/app/api/orders/create/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      notes,
      items,
      total,
      paymentMethod,
      status = 'pending'
    } = body

    // Validar campos requeridos
    if (!customerName || !customerEmail || !customerPhone || !items || !total) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress: customerAddress || '',
        customerCity: customerCity || '',
        notes: notes || '',
        items: JSON.stringify(items),
        total,
        paymentMethod,
        status,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden', details: error.message },
      { status: 500 }
    )
  }
}
```

## 🔍 Modelo Order en Prisma

**Archivo**: `prisma/schema.prisma`

```prisma
model Order {
  id              String       @id @default(cuid())
  customerName    String
  customerEmail   String
  customerPhone   String
  customerAddress String?
  customerCity    String?
  notes           String?
  items           String       // JSON string de los productos
  total           Float
  paymentMethod   String
  status          String       @default("pending")
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@map("orders")
}
```

## 💡 Consejos

1. **Si ves "P2021"**: La tabla no existe → Ejecuta `npx prisma db push`
2. **Si ves "P1000"**: Problema de conexión → Verifica DATABASE_URL
3. **Si ves "P1001"**: BD no está corriendo → Inicia el servidor de BD
4. **Si ves otro error**: Ejecuta `npx prisma migrate reset`

## 🎯 Resultado Esperado

Después de ejecutar los comandos, deberías poder:

1. ✅ Ir a `/tienda`
2. ✅ Agregar un producto al carrito
3. ✅ Ir a checkout
4. ✅ Llenar el formulario
5. ✅ Hacer clic en "Finalizar Compra"
6. ✅ Ver que se crea la orden sin errores
7. ✅ Ser redirigido a la página de confirmación

---

**Última actualización**: 2025-11-15
**Versión**: 1.0
**Estado**: 🟢 Listo

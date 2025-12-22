# 🚀 EJECUTAR MIGRACIÓN DE ORDERS

## ⚠️ Importante

Antes de probar el checkout, debes aplicar la migración de base de datos para crear la tabla `orders`.

## 📋 Pasos para Aplicar la Migración

### Opción 1: Desarrollo Local

```bash
cd botexperimento
npx prisma generate
npx prisma migrate dev --name add_order_model
```

### Opción 2: Producción (Easypanel)

```bash
cd botexperimento
npx prisma migrate deploy
```

## ✅ Verificar que Funcionó

Después de aplicar la migración, deberías ver:
- ✅ Tabla `orders` creada en la base de datos
- ✅ Cliente de Prisma regenerado
- ✅ Sin errores en la consola

## 🧪 Probar el Checkout

1. Abre: `http://localhost:3000/tienda/checkout`
2. Llena el formulario
3. Selecciona método de pago
4. Haz clic en "Finalizar Compra"
5. Deberías ver la página de confirmación

## 📊 Estructura de la Tabla Orders

```sql
CREATE TABLE "orders" (
  "id" TEXT PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerAddress" TEXT,
  "customerCity" TEXT,
  "notes" TEXT,
  "items" TEXT NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 Verificar en la Base de Datos

```sql
-- Ver todas las órdenes
SELECT * FROM orders;

-- Ver órdenes pendientes
SELECT * FROM orders WHERE status = 'pending';

-- Contar órdenes por método de pago
SELECT paymentMethod, COUNT(*) 
FROM orders 
GROUP BY paymentMethod;
```

## ⚠️ Si Hay Errores

### Error: "Table orders does not exist"
**Solución:** Aplica la migración con `npx prisma migrate dev`

### Error: "Prisma Client not generated"
**Solución:** Ejecuta `npx prisma generate`

### Error: "EPERM: operation not permitted"
**Solución:** 
1. Cierra el servidor de desarrollo
2. Ejecuta `npx prisma generate` nuevamente
3. Reinicia el servidor

## 📝 Notas

- La migración es segura y no afecta datos existentes
- Se puede ejecutar múltiples veces sin problemas
- En producción, usa `migrate deploy` en lugar de `migrate dev`

---

**Una vez aplicada la migración, el checkout estará 100% funcional** ✅

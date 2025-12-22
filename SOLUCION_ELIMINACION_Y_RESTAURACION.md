# 🔧 Solución: Eliminación de Productos y Restauración

## Problema 1: Eliminación de Productos Seleccionados

### Estado Actual
El botón "Eliminar seleccionados" **SÍ existe** en el código y está bien implementado en `src/components/ProductsManagement.tsx`.

### Posibles Causas del Problema

1. **El botón no aparece** → Solo aparece cuando hay productos seleccionados
2. **El botón no responde** → Puede ser un problema de permisos o API
3. **Error silencioso** → Revisar consola del navegador

### Verificación Rápida

1. **Abrir Dashboard** → Ir a Productos
2. **Seleccionar un producto** → Click en el checkbox
3. **Verificar que aparezca** el botón rojo "Eliminar X producto(s)"
4. **Abrir consola del navegador** (F12) y buscar errores

### Si el Botón No Aparece

El botón solo se muestra cuando `selectedProducts.size > 0`. Verifica:

```typescript
// El botón está en la línea ~750 de ProductsManagement.tsx
{selectedProducts.size > 0 && (
  <Button
    variant="destructive"
    size="sm"
    onClick={handleDeleteSelected}
    disabled={isDeleting}
  >
    <Trash2 className="w-4 h-4" />
    {isDeleting ? 'Eliminando...' : `Eliminar ${selectedProducts.size} producto(s)`}
  </Button>
)}
```

### Si el Botón No Funciona

Verificar que la API de eliminación funcione:

```bash
# Probar eliminación manual
curl -X DELETE http://localhost:3000/api/products/[ID_DEL_PRODUCTO]
```

### Solución Alternativa: Eliminar Uno por Uno

Si la eliminación masiva no funciona, usa el botón de basura (🗑️) individual en cada producto.

---

## Problema 2: Restaurar Productos con Fotos

### Script Creado: `restaurar-productos-con-fotos.js`

Este script restaura los productos anteriores con sus fotos originales.

### Cómo Usar

```bash
# 1. Ejecutar el script
npx tsx restaurar-productos-con-fotos.js

# 2. Verificar en el dashboard
# Los productos deberían aparecer con sus fotos
```

### Productos Incluidos

Actualmente el script incluye:
- ✅ Curso Completo de Piano (con 2 fotos)

### Agregar Más Productos

Edita el archivo `restaurar-productos-con-fotos.js` y agrega más productos al array `productosARestaurar`:

```javascript
const productosARestaurar = [
  {
    name: "Nombre del Producto",
    description: "Descripción completa...",
    price: 100000,
    currency: "COP",
    category: "DIGITAL", // o "PHYSICAL" o "SERVICE"
    status: "AVAILABLE",
    images: [
      "https://url-de-la-imagen-1.jpg",
      "https://url-de-la-imagen-2.jpg"
    ],
    tags: ["tag1", "tag2", "tag3"],
    stock: 999,
    paymentLinkCustom: "https://link-de-pago.com"
  },
  // Agregar más productos aquí...
]
```

### Encontrar URLs de Imágenes

Para productos que ya tenías:

1. **Buscar en archivos JSON antiguos:**
   ```bash
   # Buscar archivos de productos
   dir *.json | findstr producto
   ```

2. **Buscar en la base de datos:**
   ```bash
   # Ver productos actuales
   npx prisma studio
   # Ir a la tabla "Product" y copiar las URLs de images
   ```

3. **Usar imágenes de internet:**
   - Google Images
   - Unsplash (https://unsplash.com)
   - Pexels (https://pexels.com)

### Formato de Imágenes

```javascript
images: [
  "https://ejemplo.com/imagen1.jpg",  // Imagen principal
  "https://ejemplo.com/imagen2.jpg",  // Imagen secundaria
  "https://ejemplo.com/imagen3.jpg"   // Más imágenes (opcional)
]
```

---

## Verificación Final

### 1. Productos Restaurados

```bash
# Ver productos en la base de datos
npx prisma studio

# O consultar directamente
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then(p => console.log(p.length + ' productos'));
"
```

### 2. Fotos Visibles

1. Abrir dashboard
2. Ir a Productos
3. Verificar que las imágenes se muestren correctamente
4. Si no se ven, verificar que las URLs sean válidas

### 3. Eliminación Funciona

1. Seleccionar un producto de prueba
2. Click en "Eliminar 1 producto(s)"
3. Confirmar
4. Verificar que se eliminó

---

## Comandos Rápidos

```bash
# Restaurar productos
npx tsx restaurar-productos-con-fotos.js

# Ver productos actuales
npx prisma studio

# Eliminar todos los productos (CUIDADO!)
# Solo si quieres empezar de cero
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.deleteMany().then(() => console.log('Todos eliminados'));
"

# Contar productos
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.count().then(c => console.log(c + ' productos'));
"
```

---

## Troubleshooting

### Error: "Cannot find module"
```bash
npm install
npx prisma generate
```

### Error: "User not found"
Edita el script y cambia el email:
```javascript
where: {
  email: 'TU_EMAIL_AQUI@gmail.com'
}
```

### Imágenes no se ven
- Verifica que las URLs sean públicas
- Prueba abrir la URL en el navegador
- Usa URLs de HTTPS (no HTTP)

---

**Fecha**: 19 Nov 2025  
**Archivos**: 
- `restaurar-productos-con-fotos.js` - Script de restauración
- `src/components/ProductsManagement.tsx` - Componente con eliminación

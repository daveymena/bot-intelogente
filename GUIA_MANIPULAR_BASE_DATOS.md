# 🗄️ Guía: Manipular Base de Datos Manualmente

## 📋 Opciones Disponibles

### 1. Prisma Studio (Recomendado - Interfaz Visual)
### 2. Scripts TypeScript (Programático)
### 3. Cliente PostgreSQL (Línea de comandos)
### 4. Herramientas GUI (DBeaver, pgAdmin, etc.)

---

## 🎨 OPCIÓN 1: Prisma Studio (MÁS FÁCIL)

### ¿Qué es?
Interfaz visual para ver y editar tu base de datos.

### Cómo usarlo

#### Localmente:
```bash
# Abrir Prisma Studio
npx prisma studio

# Se abre en: http://localhost:5555
```

#### En Easypanel:
```bash
# Conectar por SSH al contenedor
docker exec -it <nombre-contenedor> sh

# Dentro del contenedor
npx prisma studio --port 5555

# Luego hacer port forwarding desde tu máquina local
# (Requiere configuración adicional)
```

### Funciones:
- ✅ Ver todas las tablas
- ✅ Agregar registros
- ✅ Editar registros
- ✅ Eliminar registros
- ✅ Buscar y filtrar
- ✅ Interfaz visual amigable

---

## 💻 OPCIÓN 2: Scripts TypeScript (RECOMENDADO)

### Ver Datos

```typescript
// scripts/ver-datos.ts
import { db } from '../src/lib/db'

async function verDatos() {
  // Ver todos los usuarios
  const users = await db.user.findMany()
  console.log('Usuarios:', users)

  // Ver todos los productos
  const products = await db.product.findMany()
  console.log('Productos:', products)

  // Ver conversaciones
  const conversations = await db.conversation.findMany({
    include: {
      messages: true
    }
  })
  console.log('Conversaciones:', conversations)
}

verDatos()
  .then(() => process.exit(0))
  .catch(console.error)
```

```bash
# Ejecutar
npx tsx scripts/ver-datos.ts
```

### Agregar Datos

```typescript
// scripts/agregar-producto.ts
import { db } from '../src/lib/db'

async function agregarProducto() {
  const user = await db.user.findFirst()
  
  const producto = await db.product.create({
    data: {
      name: 'Laptop HP Pavilion',
      description: 'Laptop HP Pavilion 15.6" Intel Core i5',
      price: 1500000,
      currency: 'COP',
      category: 'PHYSICAL',
      status: 'AVAILABLE',
      userId: user!.id
    }
  })

  console.log('Producto creado:', producto)
}

agregarProducto()
  .then(() => process.exit(0))
  .catch(console.error)
```

### Actualizar Datos

```typescript
// scripts/actualizar-producto.ts
import { db } from '../src/lib/db'

async function actualizarProducto() {
  // Buscar producto por nombre
  const producto = await db.product.findFirst({
    where: {
      name: {
        contains: 'Laptop HP'
      }
    }
  })

  if (!producto) {
    console.log('Producto no encontrado')
    return
  }

  // Actualizar precio
  const actualizado = await db.product.update({
    where: { id: producto.id },
    data: {
      price: 1800000,
      description: 'Laptop HP Pavilion 15.6" Intel Core i5 - OFERTA'
    }
  })

  console.log('Producto actualizado:', actualizado)
}

actualizarProducto()
  .then(() => process.exit(0))
  .catch(console.error)
```

### Eliminar Datos

```typescript
// scripts/eliminar-producto.ts
import { db } from '../src/lib/db'

async function eliminarProducto() {
  // Eliminar por ID
  await db.product.delete({
    where: { id: 'producto-id-aqui' }
  })

  // O eliminar por condición
  await db.product.deleteMany({
    where: {
      price: { lt: 10000 } // Eliminar productos con precio < 10000
    }
  })

  console.log('Productos eliminados')
}

eliminarProducto()
  .then(() => process.exit(0))
  .catch(console.error)
```

### Consultas Avanzadas

```typescript
// scripts/consultas-avanzadas.ts
import { db } from '../src/lib/db'

async function consultasAvanzadas() {
  // 1. Buscar productos por rango de precio
  const productosCaros = await db.product.findMany({
    where: {
      price: {
        gte: 1000000, // Mayor o igual a 1M
        lte: 2000000  // Menor o igual a 2M
      }
    }
  })

  // 2. Buscar productos con texto
  const tablets = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'tablet', mode: 'insensitive' } },
        { description: { contains: 'tablet', mode: 'insensitive' } }
      ]
    }
  })

  // 3. Contar productos por categoría
  const porCategoria = await db.product.groupBy({
    by: ['category'],
    _count: true
  })

  // 4. Obtener productos con relaciones
  const productosConUsuario = await db.product.findMany({
    include: {
      user: true
    }
  })

  // 5. Ordenar y limitar
  const ultimosProductos = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log('Productos caros:', productosCaros.length)
  console.log('Tablets:', tablets.length)
  console.log('Por categoría:', porCategoria)
}

consultasAvanzadas()
  .then(() => process.exit(0))
  .catch(console.error)
```

---

## 🔧 OPCIÓN 3: Cliente PostgreSQL

### Conectar desde tu máquina local

```bash
# Instalar psql (si no lo tienes)
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt install postgresql-client

# Conectar
psql "postgresql://postgres:9feb7a0e7110d6a42e93@157.173.97.41:5432/botwhatsapp"
```

### Comandos SQL útiles

```sql
-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d products

-- Ver todos los productos
SELECT * FROM products;

-- Ver productos con precio > 100000
SELECT * FROM products WHERE price > 100000;

-- Contar productos
SELECT COUNT(*) FROM products;

-- Actualizar precio
UPDATE products SET price = 500000 WHERE id = 'producto-id';

-- Eliminar producto
DELETE FROM products WHERE id = 'producto-id';

-- Ver conversaciones con mensajes
SELECT c.*, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m."conversationId" = c.id
GROUP BY c.id;

-- Ver usuarios
SELECT * FROM users;

-- Salir
\q
```

---

## 🖥️ OPCIÓN 4: Herramientas GUI

### DBeaver (Recomendado - Gratis)

1. **Descargar:** https://dbeaver.io/download/
2. **Instalar** DBeaver Community
3. **Crear conexión:**
   - Host: `157.173.97.41`
   - Port: `5432`
   - Database: `botwhatsapp`
   - Username: `postgres`
   - Password: `9feb7a0e7110d6a42e93`

4. **Usar:**
   - Ver tablas en el árbol izquierdo
   - Doble click para ver datos
   - Click derecho → Edit para modificar
   - SQL Editor para consultas personalizadas

### pgAdmin (Alternativa)

1. **Descargar:** https://www.pgadmin.org/download/
2. **Configurar** igual que DBeaver
3. **Usar** interfaz web

### TablePlus (Mac/Windows - Pago)

1. **Descargar:** https://tableplus.com/
2. **Configurar** conexión
3. **Interfaz** muy amigable

---

## 📝 Scripts Útiles Ya Creados

### Ver productos
```bash
npx tsx scripts/ver-productos-usuario.ts
```

### Ver estadísticas
```bash
npx tsx scripts/diagnosticar-sistema.ts
```

### Eliminar todos los productos
```bash
npx tsx scripts/eliminar-todos-productos.ts
```

### Verificar sistema
```bash
npx tsx scripts/verificar-sistema-razonamiento.ts
```

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Agregar 10 productos de prueba

```typescript
// scripts/agregar-productos-prueba.ts
import { db } from '../src/lib/db'

async function agregarProductosPrueba() {
  const user = await db.user.findFirst()
  
  const productos = [
    { name: 'Laptop HP', price: 1500000, category: 'PHYSICAL' },
    { name: 'Mouse Logitech', price: 50000, category: 'PHYSICAL' },
    { name: 'Teclado Mecánico', price: 150000, category: 'PHYSICAL' },
    { name: 'Monitor Samsung 24"', price: 600000, category: 'PHYSICAL' },
    { name: 'Webcam HD', price: 120000, category: 'PHYSICAL' },
    { name: 'Curso de Python', price: 80000, category: 'DIGITAL' },
    { name: 'Curso de JavaScript', price: 90000, category: 'DIGITAL' },
    { name: 'Ebook Marketing', price: 30000, category: 'DIGITAL' },
    { name: 'Plantillas Excel', price: 25000, category: 'DIGITAL' },
    { name: 'Pack de Iconos', price: 15000, category: 'DIGITAL' }
  ]

  for (const prod of productos) {
    await db.product.create({
      data: {
        ...prod,
        description: `Descripción de ${prod.name}`,
        currency: 'COP',
        status: 'AVAILABLE',
        userId: user!.id
      }
    })
    console.log(`✅ Creado: ${prod.name}`)
  }

  console.log('\n✅ 10 productos creados')
}

agregarProductosPrueba()
  .then(() => process.exit(0))
  .catch(console.error)
```

### Ejemplo 2: Actualizar precios en masa

```typescript
// scripts/actualizar-precios.ts
import { db } from '../src/lib/db'

async function actualizarPrecios() {
  // Aumentar 10% todos los productos físicos
  await db.product.updateMany({
    where: { category: 'PHYSICAL' },
    data: {
      price: {
        multiply: 1.1
      }
    }
  })

  // Reducir 20% productos digitales
  await db.product.updateMany({
    where: { category: 'DIGITAL' },
    data: {
      price: {
        multiply: 0.8
      }
    }
  })

  console.log('✅ Precios actualizados')
}

actualizarPrecios()
  .then(() => process.exit(0))
  .catch(console.error)
```

### Ejemplo 3: Limpiar conversaciones antiguas

```typescript
// scripts/limpiar-conversaciones.ts
import { db } from '../src/lib/db'

async function limpiarConversaciones() {
  // Eliminar conversaciones de hace más de 30 días
  const hace30Dias = new Date()
  hace30Dias.setDate(hace30Dias.getDate() - 30)

  const eliminadas = await db.conversation.deleteMany({
    where: {
      lastMessageAt: {
        lt: hace30Dias
      }
    }
  })

  console.log(`✅ ${eliminadas.count} conversaciones eliminadas`)
}

limpiarConversaciones()
  .then(() => process.exit(0))
  .catch(console.error)
```

---

## ⚠️ Precauciones

### Antes de eliminar datos:

1. **Hacer backup:**
   ```bash
   # Backup de toda la BD
   pg_dump "postgresql://postgres:9feb7a0e7110d6a42e93@157.173.97.41:5432/botwhatsapp" > backup.sql
   ```

2. **Probar en desarrollo primero**

3. **Usar transacciones:**
   ```typescript
   await db.$transaction(async (tx) => {
     // Operaciones aquí
     // Si algo falla, todo se revierte
   })
   ```

4. **Verificar antes de eliminar:**
   ```typescript
   // Primero contar
   const count = await db.product.count({
     where: { price: { lt: 10000 } }
   })
   console.log(`Se eliminarán ${count} productos`)
   
   // Luego eliminar
   await db.product.deleteMany({
     where: { price: { lt: 10000 } }
   })
   ```

---

## 🚀 Recomendación

Para uso diario:

1. **Prisma Studio** - Para ver y editar datos rápidamente
2. **Scripts TypeScript** - Para operaciones repetitivas
3. **DBeaver** - Para consultas SQL complejas

¿Qué tipo de operación necesitas hacer en la base de datos?

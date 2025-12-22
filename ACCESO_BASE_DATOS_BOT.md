# 🗄️ Acceso del Bot a la Base de Datos

## ✅ El Bot YA Tiene Acceso Completo a la Base de Datos

Tu bot **SÍ está conectado** a la base de datos y la usa activamente para:
- Buscar productos
- Obtener información real
- Mantener historial de conversaciones
- Guardar datos de clientes

## 🔍 Cómo el Bot Busca en la Base de Datos

### 1. **Búsqueda de Productos por Palabras Clave**

Cuando un cliente escribe algo como "busco un laptop":

```typescript
// El bot busca en la base de datos
const product = await ProductIntelligenceService.findProduct(
  "busco un laptop",  // Mensaje del cliente
  userId              // ID del usuario/tienda
)

// Esto ejecuta una consulta a la BD:
await db.product.findMany({
  where: {
    userId: userId,
    status: 'AVAILABLE',
    OR: [
      { name: { contains: 'laptop', mode: 'insensitive' } },
      { description: { contains: 'laptop', mode: 'insensitive' } },
      { tags: { contains: 'laptop' } }
    ]
  }
})
```

**Resultado:** El bot encuentra todos los laptops disponibles en tu tienda.

### 2. **Búsqueda por Presupuesto**

Cuando el cliente dice "hasta 2 millones":

```typescript
// El bot busca alternativas más baratas
const alternatives = await ProductContextManager.findCheaperAlternatives(
  userId,
  productId,
  2000000,  // Presupuesto máximo
  category
)

// Consulta a la BD:
await db.product.findMany({
  where: {
    userId: userId,
    status: 'AVAILABLE',
    category: category,
    price: { lte: 2000000 }  // Menor o igual a 2 millones
  },
  orderBy: { price: 'desc' }
})
```

**Resultado:** El bot muestra productos dentro del presupuesto del cliente.

### 3. **Historial de Conversaciones**

El bot carga las últimas 24 horas de conversación:

```typescript
// Cargar historial desde la BD
const conversation = await db.conversation.findFirst({
  where: {
    userId: userId,
    customerPhone: customerPhone,
    status: 'ACTIVE'
  },
  include: {
    messages: {
      where: {
        createdAt: { gte: twentyFourHoursAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
})
```

**Resultado:** El bot recuerda toda la conversación y da respuestas contextuales.

### 4. **Información Completa del Producto**

Cuando encuentra un producto, obtiene TODA la información:

```typescript
const product = await db.product.findUnique({
  where: { id: productId }
})

// El bot tiene acceso a:
// - product.name (nombre)
// - product.price (precio)
// - product.description (descripción)
// - product.images (fotos)
// - product.tags (etiquetas)
// - product.stock (inventario)
// - product.category (categoría)
```

**Resultado:** El bot responde con información real y actualizada.

## 📊 Ejemplo Real de Búsqueda

### Conversación:

```
👤 Cliente: "Hola, busco un laptop para trabajo"

🤖 Bot (internamente):
   1. Busca en BD: productos con "laptop" en nombre/descripción
   2. Filtra: solo productos DISPONIBLES del usuario
   3. Encuentra: 3 laptops disponibles
   4. Selecciona: el más adecuado para "trabajo"

🤖 Bot (responde):
   "¡Perfecto! 💻 Te cuento sobre nuestro Laptop ASUS VivoBook 15:
   
   ✨ Características:
   • Intel Core i5
   • 8GB RAM
   • 512GB SSD
   
   💰 Precio: $2.500.000
   
   [Información REAL de la base de datos]"
```

## 🔄 Flujo Completo de Búsqueda

```
┌─────────────────────────────────────────────────────────┐
│         FLUJO DE BÚSQUEDA EN BASE DE DATOS              │
└─────────────────────────────────────────────────────────┘

1. Cliente envía mensaje
   "Busco un laptop"
   ↓

2. Bot analiza mensaje
   Palabras clave: ["laptop"]
   ↓

3. Bot busca en BD
   SELECT * FROM products
   WHERE userId = 'xxx'
   AND status = 'AVAILABLE'
   AND (name LIKE '%laptop%' OR description LIKE '%laptop%')
   ↓

4. Bot encuentra productos
   [
     { id: 1, name: "ASUS VivoBook", price: 2500000 },
     { id: 2, name: "Lenovo IdeaPad", price: 1850000 },
     { id: 3, name: "HP Pavilion", price: 3200000 }
   ]
   ↓

5. Bot selecciona el mejor
   Basado en: precio, descripción, popularidad
   ↓

6. Bot obtiene información completa
   SELECT * FROM products WHERE id = 1
   ↓

7. Bot genera respuesta
   Con información REAL del producto
   ↓

8. Bot envía respuesta al cliente
   "¡Perfecto! Te cuento sobre el ASUS VivoBook..."
```

## 📋 Tablas de la Base de Datos que Usa el Bot

### 1. **products** (Productos)
```sql
- id
- userId (dueño del producto)
- name (nombre)
- description (descripción)
- price (precio)
- images (fotos)
- tags (etiquetas)
- stock (inventario)
- category (categoría)
- status (AVAILABLE/SOLD_OUT)
```

### 2. **conversations** (Conversaciones)
```sql
- id
- userId
- customerPhone
- customerName
- status (ACTIVE/CLOSED)
- createdAt
```

### 3. **messages** (Mensajes)
```sql
- id
- conversationId
- content (contenido del mensaje)
- direction (INCOMING/OUTGOING)
- createdAt
```

### 4. **botSettings** (Configuración)
```sql
- userId
- botPersonality (personalidad del bot)
- businessName
- businessPhone
```

## ✅ Verificación de Acceso a BD

### Para verificar que el bot está usando la BD:

1. **Revisa los logs:**
```bash
npm run dev

# Busca en logs:
[AI] 🔍 Búsqueda en BD - Producto encontrado: [nombre]
[AI] 💾 Producto recuperado de memoria: [nombre]
[AI] 📚 Historial cargado: X mensajes de las últimas 24h
```

2. **Prueba una búsqueda:**
```
Cliente: "Busco un laptop"

# El bot debe responder con productos REALES de tu BD
# No con información inventada
```

3. **Verifica en el dashboard:**
```
http://localhost:3000/dashboard

# Ve a "Productos"
# Los productos que veas ahí son los que el bot puede buscar
```

## 🎯 Funciones de Búsqueda Disponibles

### El bot puede buscar por:

1. **Nombre del producto**
   - "busco un laptop"
   - "quiero el curso de piano"
   - "me interesa la moto"

2. **Categoría**
   - "laptops disponibles"
   - "cursos digitales"
   - "productos de tecnología"

3. **Precio**
   - "hasta 2 millones"
   - "menos de 500 mil"
   - "entre 1 y 2 millones"

4. **Características**
   - "laptop con 8GB RAM"
   - "moto 160cc"
   - "curso de piano para principiantes"

5. **Historial**
   - Si el cliente mencionó un producto antes
   - El bot lo recuerda y puede referirse a él

## 🔧 Cómo Agregar Más Productos

### Para que el bot pueda vender más productos:

1. **Desde el Dashboard:**
```
http://localhost:3000/dashboard
→ Productos
→ Agregar Producto
→ Llenar información
→ Guardar
```

2. **El bot automáticamente:**
   - Detecta el nuevo producto
   - Lo incluye en búsquedas
   - Puede recomendarlo a clientes

## 📊 Estadísticas de Uso de BD

El bot registra:
- ✅ Productos buscados
- ✅ Productos encontrados
- ✅ Productos no encontrados
- ✅ Conversaciones activas
- ✅ Mensajes procesados

## ✅ Resumen

**El bot SÍ tiene acceso completo a la base de datos:**

1. ✅ Busca productos por palabras clave
2. ✅ Filtra por precio y categoría
3. ✅ Obtiene información real y actualizada
4. ✅ Mantiene historial de conversaciones
5. ✅ Recuerda productos mencionados
6. ✅ Busca alternativas según presupuesto
7. ✅ Accede a fotos, precios, descripciones
8. ✅ Responde con información REAL, no inventada

**No necesitas hacer nada adicional.** El bot ya está completamente integrado con tu base de datos y la usa en cada conversación. 🎉

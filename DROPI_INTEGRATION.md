# 🚀 Integración Dropi - Dropshipping Automatizado

Sistema completo de integración con Dropi para gestionar productos y órdenes de dropshipping directamente desde tu bot de WhatsApp.

## 📋 Configuración

### 1. Token JWT de Dropi

Tu token JWT ya está configurado en `.env`:

```env
DROPI_AGENT_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
DROPI_API_URL=https://app.dropi.co/api/v1
DROPI_ENABLED=true
```

Este token es de tipo **Chatbot Agents** y tiene acceso completo a:
- ✅ Catálogo de productos
- ✅ Creación de órdenes
- ✅ Consulta de estados
- ✅ Gestión de inventario

### 2. Probar la Conexión

```bash
npx tsx scripts/test-dropi.ts
```

Este script verifica:
- Conexión con la API de Dropi
- Obtención de productos
- Búsqueda de productos
- Consulta de órdenes

## 🔌 Endpoints API Disponibles

### Productos

#### GET /api/dropi/products
Obtener todos los productos disponibles en Dropi

```bash
curl http://localhost:3000/api/dropi/products
```

Respuesta:
```json
{
  "success": true,
  "count": 150,
  "products": [
    {
      "id": 123,
      "name": "iPhone 15 Pro Max",
      "description": "...",
      "price": 1299.99,
      "sale_price": 1199.99,
      "images": ["url1", "url2"],
      "stock": 50,
      "sku": "IPH15PM",
      "category": "Celulares"
    }
  ]
}
```

#### GET /api/dropi/products?q=busqueda
Buscar productos por término

```bash
curl "http://localhost:3000/api/dropi/products?q=celular"
```

#### GET /api/dropi/products/:id
Obtener un producto específico

```bash
curl http://localhost:3000/api/dropi/products/123
```

### Órdenes

#### POST /api/dropi/orders
Crear una nueva orden en Dropi

```bash
curl -X POST http://localhost:3000/api/dropi/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+573001234567",
      "address": "Calle 123 #45-67",
      "city": "Bogotá",
      "state": "Cundinamarca",
      "zip_code": "110111",
      "country": "Colombia"
    },
    "items": [
      {
        "product_id": 123,
        "quantity": 1,
        "price": 1199.99
      }
    ],
    "shipping_method": "standard",
    "payment_method": "nequi",
    "notes": "Pedido desde WhatsApp Bot"
  }'
```

Respuesta:
```json
{
  "success": true,
  "order": {
    "id": 456,
    "order_number": "DRP-2025-456",
    "status": "pending",
    "total": 1199.99,
    "tracking_number": null,
    "tracking_url": null
  }
}
```

#### GET /api/dropi/orders
Obtener todas las órdenes

```bash
curl "http://localhost:3000/api/dropi/orders?status=pending&limit=10"
```

#### GET /api/dropi/orders/:id
Consultar estado de una orden

```bash
curl http://localhost:3000/api/dropi/orders/456
```

### Sincronización

#### POST /api/dropi/sync
Sincronizar productos de Dropi a tu base de datos

```bash
curl -X POST http://localhost:3000/api/dropi/sync
```

#### GET /api/dropi/sync
Verificar conexión con Dropi

```bash
curl http://localhost:3000/api/dropi/sync
```

## 🤖 Integración con el Bot de WhatsApp

### Ejemplo 1: Mostrar Catálogo

```typescript
// En tu servicio de IA o bot
import { DropiService } from '@/lib/dropi-service'

async function handleCatalogRequest(phoneNumber: string) {
  const products = await DropiService.getProducts()
  
  let message = '📦 *Catálogo de Productos Dropi*\n\n'
  
  products.slice(0, 10).forEach((product, index) => {
    message += `${index + 1}. *${product.name}*\n`
    message += `   💰 Precio: $${product.price}\n`
    message += `   📦 Stock: ${product.stock}\n\n`
  })
  
  message += 'Escribe el número del producto que te interesa'
  
  // Enviar mensaje por WhatsApp
  await sendWhatsAppMessage(phoneNumber, message)
}
```

### Ejemplo 2: Buscar Productos

```typescript
async function handleProductSearch(phoneNumber: string, query: string) {
  const products = await DropiService.searchProducts(query)
  
  if (products.length === 0) {
    await sendWhatsAppMessage(
      phoneNumber,
      `No encontré productos con "${query}". ¿Quieres ver el catálogo completo?`
    )
    return
  }
  
  let message = `🔍 Encontré ${products.length} productos:\n\n`
  
  products.forEach((product, index) => {
    message += `${index + 1}. ${product.name} - $${product.price}\n`
  })
  
  await sendWhatsAppMessage(phoneNumber, message)
}
```

### Ejemplo 3: Crear Orden

```typescript
async function handleOrderCreation(
  phoneNumber: string,
  customerData: any,
  selectedProducts: any[]
) {
  try {
    const order = await DropiService.createOrder({
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: phoneNumber,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        zip_code: customerData.zipCode,
        country: 'Colombia',
      },
      items: selectedProducts.map(p => ({
        product_id: p.id,
        quantity: p.quantity,
        price: p.price,
      })),
      payment_method: 'nequi',
      notes: 'Pedido desde WhatsApp Bot',
    })
    
    await sendWhatsAppMessage(
      phoneNumber,
      `✅ *Orden Creada Exitosamente*\n\n` +
      `📋 Número de orden: ${order.order_number}\n` +
      `💰 Total: $${order.total}\n` +
      `📦 Estado: ${order.status}\n\n` +
      `Te notificaremos cuando tu pedido sea enviado.`
    )
  } catch (error) {
    await sendWhatsAppMessage(
      phoneNumber,
      '❌ Hubo un error al crear tu orden. Por favor intenta de nuevo.'
    )
  }
}
```

### Ejemplo 4: Consultar Estado de Orden

```typescript
async function handleOrderStatus(phoneNumber: string, orderId: number) {
  try {
    const order = await DropiService.getOrder(orderId)
    
    let message = `📦 *Estado de tu Orden*\n\n`
    message += `📋 Orden: ${order.order_number}\n`
    message += `📊 Estado: ${order.status}\n`
    message += `💰 Total: $${order.total}\n`
    
    if (order.tracking_number) {
      message += `🚚 Guía: ${order.tracking_number}\n`
    }
    
    if (order.tracking_url) {
      message += `🔗 Rastrear: ${order.tracking_url}\n`
    }
    
    await sendWhatsAppMessage(phoneNumber, message)
  } catch (error) {
    await sendWhatsAppMessage(
      phoneNumber,
      'No encontré esa orden. Verifica el número.'
    )
  }
}
```

## 🎯 Flujo Completo de Venta

```
1. Cliente: "Hola, quiero ver celulares"
   → Bot busca en Dropi: DropiService.searchProducts('celulares')
   → Bot muestra lista de productos

2. Cliente: "Quiero el número 3"
   → Bot obtiene detalles: DropiService.getProduct(productId)
   → Bot muestra precio, imágenes, descripción

3. Cliente: "Lo quiero"
   → Bot solicita datos de envío
   → Cliente proporciona dirección

4. Bot crea orden: DropiService.createOrder(...)
   → Dropi procesa el pedido
   → Bot confirma con número de orden

5. Cliente: "¿Dónde está mi pedido?"
   → Bot consulta: DropiService.getOrder(orderId)
   → Bot muestra estado y tracking
```

## 📊 Sincronización Automática

Puedes configurar un cron job para sincronizar productos periódicamente:

```typescript
// En tu servidor o como tarea programada
import { DropiService } from '@/lib/dropi-service'

async function syncDropiProducts() {
  console.log('🔄 Sincronizando productos Dropi...')
  
  const result = await DropiService.syncProducts()
  
  console.log(`✅ Sincronización completada:`)
  console.log(`   Importados: ${result.imported}`)
  console.log(`   Actualizados: ${result.updated}`)
  console.log(`   Errores: ${result.errors}`)
}

// Ejecutar cada 6 horas
setInterval(syncDropiProducts, 6 * 60 * 60 * 1000)
```

## 🔐 Seguridad

- ✅ Token JWT almacenado en `.env` (nunca en el código)
- ✅ Endpoints protegidos por middleware
- ✅ Validación de datos en todas las peticiones
- ✅ Manejo de errores robusto

## 🚀 Próximos Pasos

1. **Ejecuta el test**: `npx tsx scripts/test-dropi.ts`
2. **Verifica los productos**: Abre http://localhost:3000/api/dropi/products
3. **Integra con tu bot**: Usa los ejemplos de código arriba
4. **Configura sincronización**: Programa la sincronización automática

## 📞 Soporte

Si tienes problemas:
1. Verifica que `DROPI_AGENT_TOKEN` esté en `.env`
2. Ejecuta el script de prueba
3. Revisa los logs de la consola
4. Consulta la documentación de Dropi: https://app.dropi.co/docs

---

✅ **Sistema Dropi completamente integrado y listo para usar**

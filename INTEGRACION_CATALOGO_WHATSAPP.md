# 🛍️ INTEGRACIÓN CON CATÁLOGO DE WHATSAPP BUSINESS

## 📋 Tu Catálogo

**URL:** https://wa.me/p/24914630374871955/573042748687
- **Product ID:** 24914630374871955
- **Business Phone:** 573042748687

## 🎯 ¿Qué es el Catálogo de WhatsApp?

El catálogo de WhatsApp Business permite:
- ✅ Mostrar productos con formato nativo de WhatsApp
- ✅ Botón "Comprar" integrado
- ✅ Galería de imágenes profesional
- ✅ Información de precio y stock
- ✅ Experiencia de compra mejorada

## 🔧 Opciones de Integración

### Opción 1: Usar Catálogo de WhatsApp (Recomendado)

**Ventajas:**
- Productos aparecen con formato nativo
- Botón "Comprar" automático
- Sincronización con WhatsApp Business
- Experiencia profesional

**Cómo funciona:**
```typescript
// El bot detecta que el cliente quiere un producto
Cliente: "Quiero ver el portátil Asus"

// Bot busca en BD local
Bot: Encuentra producto en BD

// Bot envía producto del catálogo de WhatsApp
await WhatsAppCatalogService.sendCatalogProduct(
  socket,
  clientNumber,
  productId,
  businessJid
)

// Cliente ve:
// 📦 [Producto nativo de WhatsApp]
//    Asus VivoBook
//    $1.800.000 COP
//    [Ver Producto] [Comprar]
```

### Opción 2: Base de Datos Local (Actual)

**Ventajas:**
- Control total de los datos
- Funciona sin catálogo de WhatsApp
- Personalización completa

**Cómo funciona:**
```typescript
// Bot busca en BD local
Cliente: "Quiero ver portátiles"

// Bot responde con lista de BD
Bot: "¡Claro! Tengo estas opciones:"
     💻 Asus VivoBook - $1.800.000
     💻 HP Pavilion - $2.500.000
     📸 [Fotos]
```

### Opción 3: Sistema Híbrido (Mejor de ambos)

**Ventajas:**
- Usa catálogo cuando está disponible
- Fallback a BD local
- Mejor experiencia

**Cómo funciona:**
```typescript
// 1. Bot busca en BD local
// 2. Si encuentra producto Y existe en catálogo de WhatsApp
//    → Envía producto nativo de WhatsApp
// 3. Si no existe en catálogo
//    → Envía con formato de texto + fotos
```

## 🚀 Implementación

### Paso 1: Verificar Catálogo de WhatsApp

1. Abre WhatsApp Business en tu teléfono
2. Ve a **Configuración** → **Herramientas empresariales** → **Catálogo**
3. Verifica que tengas productos agregados
4. Copia el link de un producto

### Paso 2: Activar Integración en el Bot

El código ya está implementado en `whatsapp-catalog-service.ts`.

Para usarlo, modifica `baileys-stable-service.ts`:

```typescript
// Después de buscar productos en BD
if (products.length > 0) {
  // Enviar respuesta de texto
  await socket.sendMessage(from, { text: response })
  
  // 🛍️ NUEVO: Enviar producto del catálogo de WhatsApp
  const { WhatsAppCatalogService } = await import('./whatsapp-catalog-service')
  
  // Si el producto tiene catalogId, enviarlo del catálogo
  if (products[0].catalogId) {
    await WhatsAppCatalogService.sendCatalogProduct(
      socket,
      from,
      products[0].catalogId,
      '573042748687@s.whatsapp.net'
    )
  }
}
```

### Paso 3: Agregar Campo `catalogId` a Productos

Actualiza tu base de datos para incluir el ID del catálogo:

```sql
-- Agregar campo catalogId a la tabla Product
ALTER TABLE Product ADD COLUMN catalogId TEXT;

-- Actualizar productos con su ID del catálogo
UPDATE Product 
SET catalogId = '24914630374871955' 
WHERE name LIKE '%Asus%';
```

O en Prisma:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  catalogId   String?  // ID del producto en catálogo de WhatsApp
  // ... otros campos
}
```

### Paso 4: Sincronizar Productos

Opción A - Manual:
1. Ve a tu catálogo de WhatsApp Business
2. Copia el ID de cada producto
3. Actualiza tu BD con esos IDs

Opción B - Automática (requiere WhatsApp Business API):
```typescript
// Obtener todos los productos del catálogo
const catalog = await WhatsAppCatalogService.getCatalogProducts(
  socket,
  '573042748687@s.whatsapp.net'
)

// Sincronizar con BD local
for (const product of catalog.products) {
  await db.product.upsert({
    where: { catalogId: product.id },
    update: {
      name: product.name,
      price: product.price,
      catalogId: product.id
    },
    create: {
      name: product.name,
      price: product.price,
      catalogId: product.id,
      userId: userId
    }
  })
}
```

## 📊 Comparación

| Característica | BD Local | Catálogo WhatsApp | Híbrido |
|---|---|---|---|
| **Formato** | Texto + Fotos | Nativo WhatsApp | Ambos |
| **Botón Comprar** | ❌ | ✅ | ✅ |
| **Personalización** | ✅ Alta | ⚠️ Limitada | ✅ Alta |
| **Sincronización** | Manual | Automática | Automática |
| **Experiencia** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 Recomendación

**Usa el Sistema Híbrido:**

1. Mantén tu BD local con todos los productos
2. Agrega campo `catalogId` a productos que están en WhatsApp
3. El bot enviará:
   - Producto nativo de WhatsApp (si tiene `catalogId`)
   - Formato de texto + fotos (si no tiene `catalogId`)

**Ventajas:**
- ✅ Mejor experiencia para productos en catálogo
- ✅ Funciona para todos los productos
- ✅ Fácil de mantener
- ✅ Profesional

## 💡 Ejemplo de Flujo Completo

```
Cliente: "Quiero ver el Asus VivoBook"

Bot:
1. 🧠 Analiza intención → product_detail
2. 📦 Busca en BD → Encuentra producto
3. 💾 Guarda contexto
4. 📝 Responde con texto:
   "¡Claro! Te muestro el Asus VivoBook"
5. 🛍️ Envía producto del catálogo de WhatsApp:
   [Producto nativo con botón Comprar]
6. 📸 Envía fotos adicionales (opcional)

Cliente ve:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¡Claro! Te muestro el Asus VivoBook

📦 [Producto de WhatsApp Business]
   Asus VivoBook 15
   💰 $1.800.000 COP
   
   [Ver Producto] [Comprar]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 Configuración Rápida

### 1. Ejecutar Script de Información
```bash
node sincronizar-catalogo-whatsapp.js
```

### 2. Agregar Campo a Base de Datos
```bash
# Crear migración de Prisma
npx prisma migrate dev --name add_catalog_id
```

### 3. Actualizar Productos
```javascript
// Actualizar un producto con su catalogId
await db.product.update({
  where: { id: 'producto-id' },
  data: { catalogId: '24914630374871955' }
})
```

### 4. Probar
```
Cliente: "Quiero ver productos"
Bot: [Envía producto del catálogo]
```

## 📝 Notas Importantes

1. **Catálogo de WhatsApp Business:**
   - Debe estar configurado en tu app de WhatsApp Business
   - Los productos deben estar publicados
   - Máximo 500 productos en el catálogo

2. **IDs de Productos:**
   - Cada producto en WhatsApp tiene un ID único
   - Puedes obtenerlo del link del producto
   - Formato: `https://wa.me/p/[PRODUCT_ID]/[BUSINESS_PHONE]`

3. **Sincronización:**
   - Actualiza tu BD cuando agregues productos al catálogo
   - O usa la API para sincronización automática

## 🎉 Resultado Final

Con la integración completa, tus clientes verán:

**Antes (Solo BD):**
```
💻 Asus VivoBook
⚙️ Intel i5 💾 8GB/256GB 🖥️ 15.6"
💰 $1.800.000 COP
📸 [Foto]
```

**Después (Con Catálogo):**
```
💻 Asus VivoBook
⚙️ Intel i5 💾 8GB/256GB 🖥️ 15.6"
💰 $1.800.000 COP

📦 [Producto nativo de WhatsApp]
   Asus VivoBook 15
   $1.800.000 COP
   [Ver Producto] [Comprar] ← Botón nativo
```

## 🚀 Próximos Pasos

1. ✅ Verifica tu catálogo de WhatsApp Business
2. ✅ Agrega campo `catalogId` a tu BD
3. ✅ Actualiza productos con sus IDs
4. ✅ Prueba enviando productos
5. ✅ Disfruta de la experiencia mejorada

---

**¿Necesitas ayuda?** El código está listo en `whatsapp-catalog-service.ts`

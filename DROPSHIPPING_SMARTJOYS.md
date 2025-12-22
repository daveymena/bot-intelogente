# 🛍️ Sistema de Dropshipping - SmartJoys

Sistema automatizado para importar productos de SmartJoys a tu bot de WhatsApp.

## 🎯 ¿Qué hace?

Este sistema te permite:
- ✅ Extraer productos automáticamente de SmartJoys
- ✅ Importarlos a tu base de datos
- ✅ Venderlos a través de tu bot de WhatsApp
- ✅ Actualizar precios automáticamente
- ✅ Categorizar productos inteligentemente

## 📋 Requisitos

```bash
npm install axios cheerio
```

## 🚀 Uso Rápido

### Paso 1: Scrapear productos de SmartJoys

```bash
npx tsx scripts/scrape-smartjoys.ts
```

Esto:
- Visita smartjoys.co
- Extrae información de productos
- Guarda todo en `scripts/smartjoys-productos.json`

### Paso 2: Importar a tu base de datos

```bash
npx tsx scripts/import-smartjoys.ts
```

Esto:
- Lee el JSON generado
- Importa productos a tu base de datos
- Evita duplicados
- Actualiza precios si cambiaron

## 📊 Categorías Detectadas Automáticamente

El sistema categoriza productos inteligentemente:

- 🎧 **Audífonos** - Auriculares, earbuds, headphones
- 🔌 **Cargadores y Cables** - USB, Type-C, Lightning
- ⌚ **Smartwatches** - Relojes inteligentes
- 🔊 **Parlantes** - Speakers, bocinas
- 🔋 **Power Banks** - Baterías portátiles
- 📱 **Accesorios** - Fundas, protectores
- 🖱️ **Periféricos** - Mouse, teclados
- 📷 **Cámaras** - Cámaras web, seguridad
- 💡 **Iluminación** - Luces LED, lámparas

## 🤖 Integración con el Bot

Cada producto importado incluye:

```
✅ Nombre del producto
✅ Descripción detallada
✅ Precio en COP
✅ Imágenes del producto
✅ Categoría automática
✅ Tags: dropshipping, smartjoys, tecnología
✅ Respuesta automática personalizada
```

### Ejemplo de respuesta del bot:

```
¡Excelente elección! 🎉

Audífonos Bluetooth TWS Pro

💰 Precio: $89,900 COP

📦 Producto de dropshipping - Envío directo desde nuestro proveedor
⏱️ Tiempo de entrega: 3-5 días hábiles
✅ Producto nuevo y original

Audífonos inalámbricos con cancelación de ruido...

¿Te gustaría hacer el pedido? 🛒
```

## 🔄 Actualización de Productos

Para mantener tu catálogo actualizado:

```bash
# Ejecuta ambos comandos periódicamente
npx tsx scripts/scrape-smartjoys.ts
npx tsx scripts/import-smartjoys.ts
```

El sistema:
- ✅ Detecta productos nuevos y los agrega
- ✅ Actualiza precios si cambiaron
- ✅ Omite duplicados automáticamente

## 📝 Personalización

### Agregar más URLs para scrapear

Edita `scripts/scrape-smartjoys.ts`:

```typescript
const urlsToScrape = [
  `${baseUrl}/`,
  `${baseUrl}/collections/all`,
  `${baseUrl}/collections/tu-categoria`,  // Agregar aquí
];
```

### Personalizar respuestas automáticas

Edita `scripts/import-smartjoys.ts`:

```typescript
autoResponse: `Tu mensaje personalizado aquí...`
```

### Ajustar categorías

Edita la función `categorizeProduct()` en ambos scripts.

## 🎨 Configuración de Márgenes

Para agregar tu margen de ganancia, edita el precio al importar:

```typescript
price: product.price * 1.3,  // 30% de margen
```

## 📦 Estructura de Datos

Cada producto scrapeado contiene:

```typescript
{
  name: string;           // Nombre del producto
  description: string;    // Descripción
  price: number;          // Precio en COP
  category: string;       // Categoría
  images: string[];       // URLs de imágenes
  url: string;           // URL original
  sku?: string;          // Código del producto
}
```

## 🔧 Solución de Problemas

### Error: "No se encontró el archivo JSON"
```bash
# Primero ejecuta el scraper
npx tsx scripts/scrape-smartjoys.ts
```

### Error: "No se encontró usuario admin"
```bash
# Crea un usuario admin
npx tsx scripts/create-admin.ts
```

### Productos no se importan
- Verifica que la estructura del sitio no haya cambiado
- Revisa los selectores CSS en `scrape-smartjoys.ts`
- Mira los logs para ver qué productos se detectaron

## 🚀 Automatización

Para automatizar la actualización diaria:

### Windows (Task Scheduler)
```bash
# Crear un .bat
@echo off
cd C:\ruta\a\tu\proyecto
call npx tsx scripts/scrape-smartjoys.ts
call npx tsx scripts/import-smartjoys.ts
```

### Linux/Mac (Cron)
```bash
# Agregar a crontab
0 2 * * * cd /ruta/proyecto && npx tsx scripts/scrape-smartjoys.ts && npx tsx scripts/import-smartjoys.ts
```

## 💡 Consejos

1. **Respeta el sitio**: No hagas scraping muy frecuente (máximo 1-2 veces al día)
2. **Verifica precios**: Revisa que los precios extraídos sean correctos
3. **Agrega margen**: Considera tus costos de operación
4. **Actualiza descripciones**: Personaliza las descripciones para tu marca
5. **Imágenes**: Considera descargar y hospedar las imágenes localmente

## 📈 Próximos Pasos

1. Ejecuta el scraper
2. Revisa el JSON generado
3. Importa a tu base de datos
4. Prueba el bot con los nuevos productos
5. Configura actualizaciones automáticas

## 🎯 Modelo de Negocio Dropshipping

Con este sistema puedes:

1. **Sin inventario**: Vende sin comprar stock
2. **Automatizado**: El bot maneja las ventas
3. **Escalable**: Agrega más proveedores fácilmente
4. **Actualizado**: Precios siempre al día

## 📞 Flujo de Venta

1. Cliente pregunta por producto en WhatsApp
2. Bot muestra producto con precio y detalles
3. Cliente confirma compra
4. Tú haces el pedido a SmartJoys
5. SmartJoys envía directo al cliente
6. Tú ganas la diferencia

¡Listo para empezar tu negocio de dropshipping! 🚀

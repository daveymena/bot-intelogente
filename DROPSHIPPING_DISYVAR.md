# 🛒 Dropshipping Disyvar - Sistema Completo

## 📋 Descripción

Sistema automatizado para extraer todo el catálogo de productos de **Disyvar.com.co** y tenerlo disponible para dropshipping en tu plataforma.

Disyvar es un proveedor colombiano de tecnología con amplio catálogo de:
- 💻 Laptops y computadores
- 🖥️ Monitores y periféricos
- 🎮 Accesorios gaming
- 📱 Tecnología móvil
- 🔌 Componentes de PC
- Y mucho más...

## 🚀 Inicio Rápido

### Opción 1: Todo en Uno (Recomendado)

```bash
npx tsx scripts/disyvar-completo.ts
```

Este comando ejecuta automáticamente:
1. ✅ Scrapea todo el catálogo de Disyvar
2. ✅ Guarda productos en JSON
3. ✅ Importa a tu base de datos
4. ✅ Productos listos para vender

### Opción 2: Paso a Paso

#### Paso 1: Scrapear Productos

```bash
npx tsx scripts/scrape-disyvar.ts
```

**Qué hace:**
- Visita Disyvar.com.co
- Descubre categorías automáticamente
- Extrae información de productos:
  - Nombre
  - Descripción
  - Precio
  - Precio original (si hay descuento)
  - Imágenes
  - Categoría
  - Marca
  - SKU
  - Especificaciones técnicas
  - URL del producto
- Guarda todo en `scripts/disyvar-productos.json`

**Tiempo estimado:** 5-15 minutos (depende del tamaño del catálogo)

#### Paso 2: Importar a Base de Datos

```bash
npx tsx scripts/import-disyvar.ts
```

**Qué hace:**
- Lee el archivo JSON generado
- Importa productos a tu base de datos
- Evita duplicados
- Actualiza productos existentes
- Agrega tags automáticos
- Configura para dropshipping

**Tiempo estimado:** 1-3 minutos

## 📁 Archivos Generados

### `scripts/disyvar-productos.json`

Archivo JSON con todos los productos extraídos:

```json
[
  {
    "name": "Laptop HP 15-dy2xxx Intel Core i5",
    "description": "Laptop HP con procesador Intel Core i5...",
    "price": 2499000,
    "originalPrice": 2999000,
    "category": "Laptops",
    "images": [
      "https://disyvar.com.co/images/laptop-hp.jpg"
    ],
    "url": "https://disyvar.com.co/producto/laptop-hp-15",
    "sku": "HP-15-DY2",
    "brand": "HP",
    "stock": "Disponible",
    "specifications": {
      "Procesador": "Intel Core i5-1135G7",
      "RAM": "8GB DDR4",
      "Almacenamiento": "256GB SSD",
      "Pantalla": "15.6\" FHD"
    }
  }
]
```

## 🎯 Características del Scraper

### Inteligente y Adaptable

- ✅ **Descubrimiento automático** de categorías
- ✅ **Múltiples selectores** para máxima compatibilidad
- ✅ **Análisis alternativo** si los selectores estándar fallan
- ✅ **Normalización de URLs** automática
- ✅ **Parseo de precios** en formato colombiano (COP)
- ✅ **Categorización automática** de productos
- ✅ **Extracción de especificaciones** técnicas
- ✅ **Detección de descuentos** y precios originales

### Respetuoso con el Servidor

- ⏱️ **Delays entre requests** (2 segundos)
- 🔄 **Reintentos automáticos** en caso de error
- 🛡️ **Headers realistas** para simular navegador
- ⚡ **Timeout configurado** (30 segundos)

### Robusto y Confiable

- 🔍 **Validación de datos** antes de guardar
- 🚫 **Eliminación de duplicados** automática
- 📊 **Estadísticas detalladas** del proceso
- 🐛 **Manejo de errores** completo
- 📝 **Logs informativos** en cada paso

## 📊 Categorías Detectadas Automáticamente

El sistema categoriza productos en:

- 💻 **Laptops**
- 🖥️ **Computadores de Escritorio**
- 📺 **Monitores**
- ⌨️ **Teclados**
- 🖱️ **Mouse**
- 🎧 **Audífonos**
- 🔊 **Parlantes**
- 📷 **Webcams**
- 🎤 **Micrófonos**
- 🖨️ **Impresoras**
- 📡 **Redes** (Routers, Modems)
- 💾 **Almacenamiento** (SSD, HDD)
- 🧠 **Memorias RAM**
- ⚙️ **Procesadores**
- 🎮 **Tarjetas Gráficas**
- ⚡ **Fuentes de Poder**
- 🏠 **Cases**
- 🪑 **Sillas Gamer**
- 🖥️ **Escritorios**
- 🔌 **Cables y Adaptadores**
- 🔋 **Cargadores**
- 🔌 **UPS y Respaldo**

## 🔧 Configuración Avanzada

### Modificar URLs a Scrapear

Edita `scripts/scrape-disyvar.ts`:

```typescript
const urlsToScrape = [
  BASE_URL,
  `${BASE_URL}/categoria-especifica`,
  `${BASE_URL}/otra-categoria`,
  // Agrega más URLs aquí
];
```

### Ajustar Número de Productos a Enriquecer

Por defecto enriquece los primeros 50 productos con detalles completos:

```typescript
const productsToEnrich = Math.min(uniqueProducts.length, 50);
```

Cambia `50` por el número que desees.

### Modificar Delays

Para ser más rápido (no recomendado) o más lento:

```typescript
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos
```

## 📈 Estadísticas de Ejemplo

```
🚀 Iniciando scraping de Disyvar.com.co

============================================================

🔍 Descubriendo categorías del sitio...

✅ Encontradas 15 posibles categorías

📋 URLs a scrapear: 18

[1/18] Procesando...
📥 Scrapeando listado: https://disyvar.com.co
✅ Encontrados 24 productos con selector: .product-item
  ✅ Encontrados 24 productos

[2/18] Procesando...
📥 Scrapeando listado: https://disyvar.com.co/laptops
✅ Encontrados 18 productos con selector: .product-card
  ✅ Encontrados 18 productos

...

============================================================

✅ Total de productos únicos encontrados: 156

📝 Enriqueciendo 50 productos con detalles completos...

[1/50] Laptop HP 15-dy2xxx Intel Core i5...
  📄 Obteniendo detalles de: https://disyvar.com.co/producto/...

...

============================================================

💾 Productos guardados en: C:\proyecto\scripts\disyvar-productos.json
📊 Total de productos: 156

📈 Productos por categoría:
   Laptops: 42
   Monitores: 28
   Teclados: 18
   Mouse: 15
   Audífonos: 12
   Almacenamiento: 10
   ...

✨ Scraping completado exitosamente!
```

## 🎨 Integración con tu Sistema

### Productos Importados Incluyen:

```typescript
{
  name: string              // Nombre del producto
  description: string       // Descripción completa
  price: number            // Precio en COP
  currency: 'COP'          // Moneda
  category: 'PHYSICAL'     // Tipo de producto
  status: 'AVAILABLE'      // Estado
  images: string[]         // Array de URLs de imágenes
  tags: string[]           // [categoría, 'dropshipping', 'disyvar', marca]
  metadata: {
    supplier: 'Disyvar'
    supplierUrl: string    // URL del producto en Disyvar
    sku: string           // Código del producto
    brand: string         // Marca
    originalPrice: number // Precio original (si hay descuento)
    stock: string         // Estado de stock
    specifications: {}    // Especificaciones técnicas
    dropshipping: true    // Marcado como dropshipping
  }
}
```

### Acceso a los Productos

Una vez importados, los productos están disponibles en:

1. **Dashboard de Administración**
   - Gestionar productos
   - Editar precios y descripciones
   - Agregar márgenes de ganancia
   - Activar/desactivar productos

2. **Catálogo Público**
   - `http://localhost:3000/catalogo`
   - Vista pública de productos
   - Filtros por categoría
   - Búsqueda

3. **Tienda**
   - `http://localhost:3000/tienda`
   - Proceso de compra completo
   - Integración con pagos

4. **Bot de WhatsApp**
   - Respuestas automáticas sobre productos
   - Recomendaciones inteligentes
   - Envío de información y precios

## 💰 Configurar Márgenes de Ganancia

### Opción 1: Manual

Edita cada producto en el dashboard y ajusta el precio.

### Opción 2: Automática (Script)

Crea un script para agregar margen automático:

```typescript
// scripts/agregar-margen-disyvar.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MARGEN = 1.20; // 20% de ganancia

async function main() {
  const productos = await prisma.product.findMany({
    where: {
      tags: {
        contains: 'disyvar'
      }
    }
  });

  for (const producto of productos) {
    const metadata = JSON.parse(producto.metadata || '{}');
    const precioOriginal = metadata.originalPrice || producto.price;
    const precioConMargen = Math.round(precioOriginal * MARGEN);

    await prisma.product.update({
      where: { id: producto.id },
      data: {
        price: precioConMargen,
        metadata: JSON.stringify({
          ...metadata,
          precioProveedor: precioOriginal,
          margenGanancia: MARGEN,
        })
      }
    });
  }

  console.log(`✅ Margen aplicado a ${productos.length} productos`);
}

main();
```

## 🔄 Actualizar Catálogo

Para mantener el catálogo actualizado:

```bash
# Ejecutar semanalmente o cuando sea necesario
npx tsx scripts/disyvar-completo.ts
```

El script:
- ✅ Actualiza precios automáticamente
- ✅ Agrega nuevos productos
- ✅ Mantiene tus personalizaciones
- ✅ No duplica productos existentes

## 🐛 Solución de Problemas

### No se encuentran productos

**Posibles causas:**
1. El sitio requiere JavaScript para cargar productos
2. Los selectores CSS han cambiado
3. El sitio tiene protección anti-scraping

**Soluciones:**
1. Visita el sitio manualmente y revisa su estructura
2. Ajusta los selectores en `scrape-disyvar.ts`
3. Considera usar Puppeteer para sitios con JavaScript

### Error de timeout

**Solución:**
```typescript
// Aumentar timeout en scrape-disyvar.ts
timeout: 60000, // 60 segundos
```

### Productos duplicados

**Solución:**
El sistema ya elimina duplicados automáticamente, pero si persiste:

```bash
npx tsx scripts/limpiar-productos-duplicados.ts
```

### Imágenes no cargan

**Causa:** URLs relativas mal formadas

**Solución:**
Verifica la función `normalizeUrl()` en el scraper.

## 📝 Mejores Prácticas

### 1. Ejecutar en Horarios de Baja Demanda
- Preferiblemente de noche o madrugada
- Menos carga en el servidor del proveedor

### 2. No Abusar del Scraping
- Máximo 1-2 veces por semana
- Respetar los delays configurados
- No hacer requests paralelos masivos

### 3. Verificar Productos Manualmente
- Revisar algunos productos al azar
- Confirmar que precios e imágenes sean correctos
- Ajustar descripciones si es necesario

### 4. Mantener Backup
- Guardar los archivos JSON generados
- Hacer backup de la base de datos antes de importar

### 5. Agregar Valor
- Mejorar descripciones con IA
- Agregar fotos propias si es posible
- Crear bundles o paquetes especiales

## 🎯 Próximos Pasos

1. ✅ **Ejecutar el scraper**
   ```bash
   npx tsx scripts/disyvar-completo.ts
   ```

2. ✅ **Revisar productos importados**
   - Ir al dashboard
   - Verificar categorías
   - Ajustar precios si es necesario

3. ✅ **Configurar márgenes de ganancia**
   - Agregar porcentaje de utilidad
   - Considerar costos de envío

4. ✅ **Activar productos en tienda**
   - Seleccionar productos a vender
   - Configurar métodos de pago
   - Probar proceso de compra

5. ✅ **Entrenar el bot**
   - El bot ya conoce los productos
   - Probar conversaciones
   - Ajustar respuestas si es necesario

## 🎉 ¡Listo para Vender!

Con este sistema tienes:
- ✅ Catálogo completo de Disyvar
- ✅ Productos listos para dropshipping
- ✅ Integración con tu tienda
- ✅ Bot de WhatsApp configurado
- ✅ Sistema de pagos activo

**¡Empieza a vender tecnología hoy mismo!** 🚀

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta documentación
2. Verifica los logs del scraper
3. Prueba ejecutar los scripts por separado
4. Revisa la estructura del sitio web manualmente

## 🔗 Enlaces Útiles

- **Disyvar:** https://disyvar.com.co
- **Dashboard:** http://localhost:3000
- **Catálogo:** http://localhost:3000/catalogo
- **Tienda:** http://localhost:3000/tienda

---

**Creado con ❤️ para Tecnovariedades D&S**

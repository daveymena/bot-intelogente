// Importador universal de productos de dropshipping
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// 💰 CONFIGURACIÓN DE GANANCIA
const MARGEN_GANANCIA = 20000; // $20,000 COP por producto

interface Product {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  url: string;
  category: string;
  inStock: boolean;
}

function categorizarProducto(nombre: string): string {
  const texto = nombre.toLowerCase();
  
  if (texto.match(/audífono|auricular|headphone|earbud|airpod/i)) return 'Audífonos';
  if (texto.match(/cargador|cable|usb|type-c|lightning/i)) return 'Cargadores';
  if (texto.match(/smartwatch|reloj|watch|band/i)) return 'Smartwatches';
  if (texto.match(/parlante|speaker|bocina|altavoz/i)) return 'Parlantes';
  if (texto.match(/power bank|batería|powerbank|cargador portátil/i)) return 'Power Banks';
  if (texto.match(/funda|case|protector|cover/i)) return 'Fundas y Protectores';
  if (texto.match(/mouse|ratón|teclado|keyboard/i)) return 'Periféricos';
  if (texto.match(/cámara|camera|webcam/i)) return 'Cámaras';
  if (texto.match(/luz|led|lámpara|bombillo/i)) return 'Iluminación';
  if (texto.match(/soporte|holder|base|stand/i)) return 'Soportes';
  if (texto.match(/limpieza|cleaning|toallita/i)) return 'Limpieza';
  
  return 'Tecnología';
}

async function main() {
  console.log('📦 Importando productos de dropshipping...\n');

  // Leer archivo JSON
  const jsonPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró el archivo productos-dropshipping.json');
    console.log('Primero ejecuta: npm run scrape:dropshipping');
    return;
  }

  const products: Product[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`📄 Productos encontrados: ${products.length}\n`);

  // Obtener usuario admin
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.error('❌ No se encontró un usuario admin.');
    console.log('Crea uno con: npx tsx scripts/create-admin.ts');
    return;
  }

  console.log(`👤 Importando para: ${user.email}\n`);

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Verificar si ya existe
      const existing = await prisma.product.findFirst({
        where: {
          name: product.name,
          userId: user.id,
        }
      });

      const categoria = categorizarProducto(product.name);

      // 💰 CALCULAR PRECIO DE VENTA (precio original + margen)
      const precioProveedor = product.price;
      const precioVenta = precioProveedor + MARGEN_GANANCIA;
      const porcentajeGanancia = Math.round((MARGEN_GANANCIA / precioProveedor) * 100);

      if (existing) {
        // Actualizar si el precio cambió
        const nuevoPrecioVenta = precioProveedor + MARGEN_GANANCIA;
        if (existing.price !== nuevoPrecioVenta) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              price: nuevoPrecioVenta,
              description: product.description,
              images: JSON.stringify(product.images),
              status: product.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
            }
          });
          updated++;
          console.log(`🔄 ${product.name}`);
          console.log(`   Proveedor: $${precioProveedor.toLocaleString()} → Venta: $${nuevoPrecioVenta.toLocaleString()} (Ganancia: $${MARGEN_GANANCIA.toLocaleString()})`);
        } else {
          skipped++;
        }
        continue;
      }

      // Crear respuesta automática
      const autoResponse = `¡Excelente elección! 🎉

${product.name}

💰 Precio: $${precioVenta.toLocaleString()} COP

📦 Producto de dropshipping
⏱️ Entrega: 3-5 días hábiles
✅ Nuevo y original
${product.inStock ? '✅ En stock' : '⚠️ Consultar disponibilidad'}

${product.description}

¿Te gustaría hacer el pedido? 🛒`;

      // Crear producto
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: precioVenta,
          currency: 'COP',
          category: 'PHYSICAL',
          status: product.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
          images: JSON.stringify(product.images),
          tags: JSON.stringify([
            categoria,
            'dropshipping',
            'tecnología',
            'envío rápido',
          ]),
          autoResponse,
          userId: user.id,
        }
      });

      imported++;
      console.log(`✅ ${product.name}`);
      console.log(`   💵 Proveedor: $${precioProveedor.toLocaleString()}`);
      console.log(`   💰 Tu venta: $${precioVenta.toLocaleString()}`);
      console.log(`   📈 Ganancia: $${MARGEN_GANANCIA.toLocaleString()} (${porcentajeGanancia}%)`);
      if (product.discount) {
        console.log(`   🏷️ Descuento original: ${product.discount}%`);
      }

    } catch (error) {
      errors++;
      console.error(`❌ Error: ${product.name}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN');
  console.log('='.repeat(50));
  console.log(`✅ Nuevos: ${imported}`);
  console.log(`🔄 Actualizados: ${updated}`);
  console.log(`⏭️  Omitidos: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
  console.log(`📦 Total: ${products.length}`);
  console.log('='.repeat(50) + '\n');

  console.log('🎉 Importación completada!');
  console.log('Ver en: http://localhost:3000/dashboard');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

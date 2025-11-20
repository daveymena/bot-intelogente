import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductoSmartJoys {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  url: string;
  category: string;
  inStock: boolean;
  sku?: string;
  features?: string[];
}

async function importarSmartJoys() {
  console.log('🔄 ========================================');
  console.log('🔄 IMPORTANDO PRODUCTOS SMARTJOYS');
  console.log('🔄 ========================================\n');
  
  try {
    // Leer archivo JSON
    const jsonPath = path.join(process.cwd(), 'scripts', 'productos-dropshipping.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ No se encontró el archivo productos-dropshipping.json');
      console.log('\n💡 Primero ejecuta el scraper:');
      console.log('   npm run scrape:smartjoys');
      return;
    }

    const productosSmartJoys: ProductoSmartJoys[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Obtener usuario admin
    const usuario = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@smartsalesbot.com' },
          { email: 'daveymena16@gmail.com' },
          { email: 'deinermena25@gmail.com' }
        ]
      }
    });

    if (!usuario) {
      console.error('❌ No se encontró usuario admin');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}`);
    console.log(`📦 Productos SmartJoys encontrados: ${productosSmartJoys.length}\n`);

    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    // Margen de ganancia (20%)
    const MARGEN_GANANCIA = 0.20;

    for (const producto of productosSmartJoys) {
      try {
        // Aplicar margen de ganancia
        const precioConMargen = Math.round(producto.price * (1 + MARGEN_GANANCIA));

        // Crear descripción mejorada
        let descripcion = producto.description;
        
        if (producto.features && producto.features.length > 0) {
          descripcion += '\n\n✨ Características:\n';
          producto.features.forEach(feature => {
            descripcion += `• ${feature}\n`;
          });
        }

        descripcion += `\n\n💰 Precio: ${precioConMargen.toLocaleString()} COP`;
        
        if (producto.discount) {
          descripcion += `\n🔥 Descuento: ${producto.discount}%`;
        }
        
        descripcion += '\n📦 Producto de dropshipping';
        descripcion += '\n🚚 Envío a toda Colombia';
        descripcion += '\n⏱️ Tiempo de entrega: 3-5 días hábiles';

        // Verificar si ya existe
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        });

        // Categorizar producto
        const categoria = categorizarProducto(producto.name, producto.description);

        const datosProducto = {
          name: producto.name,
          description: descripcion,
          price: precioConMargen,
          currency: 'COP',
          category: 'PHYSICAL',
          subcategory: categoria,
          status: producto.inStock ? 'AVAILABLE' : 'OUT_OF_STOCK',
          images: producto.images,
          tags: [
            'dropshipping',
            'smartjoys',
            categoria.toLowerCase(),
            ...(producto.discount ? ['oferta'] : [])
          ],
          stock: producto.inStock ? 50 : 0,
          paymentLinkCustom: producto.url,
          isDigital: false
        };

        if (existente) {
          await prisma.product.update({
            where: { id: existente.id },
            data: datosProducto
          });
          console.log(`🔄 Actualizado: ${producto.name}`);
          actualizados++;
        } else {
          await prisma.product.create({
            data: {
              ...datosProducto,
              userId: usuario.id
            }
          });
          console.log(`✅ Creado: ${producto.name} - ${precioConMargen.toLocaleString()} COP`);
          creados++;
        }
      } catch (error: any) {
        console.error(`❌ Error con ${producto.name}:`, error.message);
        errores++;
      }
    }

    console.log('\n📊 ========================================');
    console.log('📊 RESUMEN FINAL');
    console.log('📊 ========================================');
    console.log(`✅ Productos creados: ${creados}`);
    console.log(`🔄 Productos actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📦 Total procesados: ${productosSmartJoys.length}`);
    console.log(`💰 Margen aplicado: ${MARGEN_GANANCIA * 100}%`);
    console.log('\n✅ ¡Productos SmartJoys importados exitosamente!');

    // Mostrar total en base de datos
    const totalDB = await prisma.product.count({
      where: { userId: usuario.id }
    });
    console.log(`\n🗄️  Total de productos en base de datos: ${totalDB}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function categorizarProducto(nombre: string, descripcion: string): string {
  const texto = (nombre + ' ' + descripcion).toLowerCase();
  
  if (texto.match(/audífono|auricular|headphone|earbud|airpod/i)) return 'Audífonos';
  if (texto.match(/cargador|cable|usb|type-c|lightning/i)) return 'Cargadores y Cables';
  if (texto.match(/smartwatch|reloj|watch|band/i)) return 'Smartwatches';
  if (texto.match(/parlante|speaker|bocina|altavoz/i)) return 'Parlantes';
  if (texto.match(/power bank|batería|powerbank|cargador portátil/i)) return 'Power Banks';
  if (texto.match(/funda|case|protector|cover/i)) return 'Fundas y Protectores';
  if (texto.match(/mouse|teclado|keyboard|ratón/i)) return 'Periféricos';
  if (texto.match(/cámara|camera|webcam/i)) return 'Cámaras';
  if (texto.match(/luz|led|lámpara|iluminación/i)) return 'Iluminación';
  if (texto.match(/soporte|holder|stand/i)) return 'Soportes';
  if (texto.match(/micrófono|mic|microphone/i)) return 'Micrófonos';
  if (texto.match(/adaptador|conversor|hub/i)) return 'Adaptadores';
  
  return 'Tecnología';
}

importarSmartJoys();

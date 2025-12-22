import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

async function buscarImagenEnSmartJoys(nombreProducto: string, page: any): Promise<string[]> {
  try {
    const searchUrl = `https://smartjoys.co/search?q=${encodeURIComponent(nombreProducto)}`;
    console.log(`   🔍 Buscando: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const imagenes = await page.evaluate(() => {
      const imgs: string[] = [];
      
      // Buscar imágenes de productos
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (src && (src.includes('product') || src.includes('cdn') || src.includes('image'))) {
          if (!imgs.includes(src)) {
            imgs.push(src);
          }
        }
      });

      return imgs.slice(0, 3); // Máximo 3 imágenes
    });

    return imagenes.map(img => 
      img.startsWith('http') ? img : 
      img.startsWith('//') ? `https:${img}` :
      `https://smartjoys.co${img}`
    );

  } catch (error) {
    console.log(`   ❌ Error buscando imágenes`);
    return [];
  }
}

function categorizarProducto(nombre: string): { subcategory: string; tags: string[] } {
  const texto = nombre.toLowerCase();
  
  // Audífonos
  if (texto.match(/audífono|auricular|airpod|earbud/i)) {
    return {
      subcategory: 'Audífonos',
      tags: ['audífonos', 'audio', 'tecnología', 'bluetooth']
    };
  }
  
  // Smartwatch
  if (texto.match(/smartwatch|reloj|watch/i)) {
    return {
      subcategory: 'Smartwatches',
      tags: ['smartwatch', 'reloj', 'tecnología', 'deportivo']
    };
  }
  
  // Parlantes
  if (texto.match(/parlante|speaker|bocina/i)) {
    return {
      subcategory: 'Parlantes',
      tags: ['parlante', 'audio', 'bluetooth', 'música']
    };
  }
  
  // Computadores/Portátiles
  if (texto.match(/portatil|laptop|macbook|notebook/i)) {
    return {
      subcategory: 'Computadores',
      tags: ['computador', 'portátil', 'laptop', 'tecnología']
    };
  }
  
  // Impresoras
  if (texto.match(/impresora|printer/i)) {
    return {
      subcategory: 'Impresoras',
      tags: ['impresora', 'oficina', 'tecnología']
    };
  }
  
  // Tablets
  if (texto.match(/tablet|ipad/i)) {
    return {
      subcategory: 'Tablets',
      tags: ['tablet', 'tecnología', 'portátil']
    };
  }
  
  // Motos
  if (texto.match(/moto|motocicleta|bajaj|pulsar/i)) {
    return {
      subcategory: 'Motocicletas',
      tags: ['moto', 'vehículo', 'transporte']
    };
  }
  
  // Cursos/Megapacks
  if (texto.match(/curso|mega pack|pack/i)) {
    return {
      subcategory: 'Cursos Digitales',
      tags: ['curso', 'digital', 'educación', 'online']
    };
  }
  
  // Power Banks
  if (texto.match(/power bank|batería|cargador portátil/i)) {
    return {
      subcategory: 'Power Banks',
      tags: ['power bank', 'batería', 'cargador', 'portátil']
    };
  }
  
  // Mouse/Teclado
  if (texto.match(/mouse|teclado|keyboard/i)) {
    return {
      subcategory: 'Periféricos',
      tags: ['periférico', 'computador', 'oficina']
    };
  }
  
  // Cámaras
  if (texto.match(/cámara|webcam|proyector/i)) {
    return {
      subcategory: 'Cámaras y Proyectores',
      tags: ['cámara', 'video', 'tecnología']
    };
  }
  
  // Oficina/Papelería
  if (texto.match(/papel|cinta|lapiz|borrador|separador/i)) {
    return {
      subcategory: 'Papelería',
      tags: ['papelería', 'oficina', 'escolar']
    };
  }
  
  // Hogar
  if (texto.match(/silla|copa|envase|toalla|cepillo/i)) {
    return {
      subcategory: 'Hogar',
      tags: ['hogar', 'casa', 'útiles']
    };
  }
  
  return {
    subcategory: 'Tecnología',
    tags: ['producto', 'tecnología']
  };
}

async function actualizarProductos() {
  console.log('🔄 Actualizando productos con imágenes y tags...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    // Obtener usuario y todos sus productos
    const usuario = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' },
      include: {
        products: {
          take: 30 // Actualizar primeros 30 productos
        }
      }
    });

    if (!usuario) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log(`✅ Usuario: ${usuario.email}`);
    console.log(`📦 Productos sin imágenes: ${usuario.products.length}\n`);

    let actualizados = 0;
    let conImagenes = 0;
    let sinImagenes = 0;

    for (const producto of usuario.products) {
      try {
        console.log(`\n📦 ${producto.name}`);
        
        // Categorizar producto
        const { subcategory, tags } = categorizarProducto(producto.name);
        
        // Buscar imágenes en SmartJoys
        const imagenes = await buscarImagenEnSmartJoys(producto.name, page);
        
        // Actualizar producto
        await prisma.product.update({
          where: { id: producto.id },
          data: {
            subcategory,
            tags,
            ...(imagenes.length > 0 && { images: imagenes })
          }
        });

        if (imagenes.length > 0) {
          console.log(`   ✅ ${imagenes.length} imágenes encontradas`);
          conImagenes++;
        } else {
          console.log(`   ⚠️  Sin imágenes`);
          sinImagenes++;
        }
        
        console.log(`   📂 Categoría: ${subcategory}`);
        console.log(`   🏷️  Tags: ${tags.join(', ')}`);
        
        actualizados++;

        // Pausa entre productos
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`✅ Productos actualizados: ${actualizados}`);
    console.log(`🖼️  Con imágenes: ${conImagenes}`);
    console.log(`⚠️  Sin imágenes: ${sinImagenes}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

actualizarProductos();

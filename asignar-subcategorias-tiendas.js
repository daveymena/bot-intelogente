// Script para asignar subcategorías y tiendas a productos existentes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function asignarSubcategoriasYTiendas() {
  console.log('🏷️  Asignando subcategorías y tiendas a productos...\n');

  try {
    const productos = await prisma.product.findMany({
      select: { id: true, name: true, category: true, images: true }
    });

    let actualizados = 0;

    for (const producto of productos) {
      let subcategory = null;
      let store = null;

      const nombre = producto.name.toLowerCase();
      const images = typeof producto.images === 'string' ? JSON.parse(producto.images) : producto.images;
      const primeraImagen = images && images[0] ? images[0] : '';

      // Detectar TIENDA por la URL de la imagen
      if (primeraImagen.includes('megacomputer.com.co')) {
        store = 'MegaComputer';
      } else if (primeraImagen.includes('/fotos/')) {
        store = 'Propio';
      } else if (primeraImagen.includes('hotmart')) {
        store = 'Hotmart';
      }

      // Detectar SUBCATEGORÍA por el nombre del producto
      if (producto.category === 'PHYSICAL') {
        // Portátiles/Laptops
        if (nombre.includes('portátil') || nombre.includes('portatil') || nombre.includes('laptop') || nombre.includes('macbook') || nombre.includes('vivobook')) {
          subcategory = 'Portátiles';
        }
        // Monitores
        else if (nombre.includes('monitor')) {
          subcategory = 'Monitores';
        }
        // Impresoras
        else if (nombre.includes('impresora') || nombre.includes('escáner') || nombre.includes('escaner')) {
          subcategory = 'Impresoras y Escáneres';
        }
        // Motos
        else if (nombre.includes('moto') || nombre.includes('bajaj') || nombre.includes('pulsar')) {
          subcategory = 'Motocicletas';
        }
        // Accesorios
        else if (nombre.includes('mouse') || nombre.includes('teclado') || nombre.includes('audífono') || nombre.includes('webcam') || nombre.includes('cable')) {
          subcategory = 'Accesorios de Computación';
        }
        // Componentes
        else if (nombre.includes('memoria') || nombre.includes('ssd') || nombre.includes('disco')) {
          subcategory = 'Componentes';
        }
        // Tablets
        else if (nombre.includes('tablet') || nombre.includes('ipad')) {
          subcategory = 'Tablets';
        }
        // Otros
        else {
          subcategory = 'Otros';
        }
      }
      else if (producto.category === 'DIGITAL') {
        // Megapacks
        if (nombre.includes('mega pack') || nombre.includes('megapack')) {
          if (nombre.includes('diseño')) {
            subcategory = 'Cursos de Diseño';
          } else if (nombre.includes('office') || nombre.includes('excel')) {
            subcategory = 'Cursos de Office';
          } else if (nombre.includes('inglés') || nombre.includes('ingles')) {
            subcategory = 'Cursos de Idiomas';
          } else if (nombre.includes('marketing')) {
            subcategory = 'Cursos de Marketing';
          } else if (nombre.includes('programación') || nombre.includes('programacion') || nombre.includes('python') || nombre.includes('javascript')) {
            subcategory = 'Cursos de Programación';
          } else if (nombre.includes('hacking') || nombre.includes('seguridad')) {
            subcategory = 'Cursos de Seguridad';
          } else {
            subcategory = 'Megapacks';
          }
          store = store || 'Propio';
        }
        // Cursos individuales
        else if (nombre.includes('curso')) {
          if (nombre.includes('piano') || nombre.includes('música') || nombre.includes('musica')) {
            subcategory = 'Cursos de Música';
          } else {
            subcategory = 'Cursos';
          }
          store = store || 'Propio';
        }
        // Libros
        else if (nombre.includes('libro') || nombre.includes('ebook')) {
          subcategory = 'Libros Digitales';
          store = store || 'Propio';
        }
        // Otros
        else {
          subcategory = 'Productos Digitales';
          store = store || 'Propio';
        }
      }
      else if (producto.category === 'SERVICE') {
        subcategory = 'Servicios';
        store = store || 'Propio';
      }

      // Actualizar producto
      if (subcategory || store) {
        await prisma.product.update({
          where: { id: producto.id },
          data: { subcategory, store }
        });
        
        console.log(`✅ ${producto.name}`);
        console.log(`   Categoría: ${producto.category} → Subcategoría: ${subcategory || 'N/A'}`);
        console.log(`   Tienda: ${store || 'N/A'}\n`);
        actualizados++;
      }
    }

    console.log(`\n✅ ${actualizados} productos actualizados con subcategorías y tiendas`);

    // Mostrar resumen
    console.log('\n📊 RESUMEN POR SUBCATEGORÍA:');
    const subcategorias = await prisma.product.groupBy({
      by: ['subcategory'],
      _count: true
    });
    
    subcategorias.forEach(s => {
      console.log(`   ${s.subcategory || 'Sin subcategoría'}: ${s._count} productos`);
    });

    console.log('\n🏪 RESUMEN POR TIENDA:');
    const tiendas = await prisma.product.groupBy({
      by: ['store'],
      _count: true
    });
    
    tiendas.forEach(t => {
      console.log(`   ${t.store || 'Sin tienda'}: ${t._count} productos`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

asignarSubcategoriasYTiendas();

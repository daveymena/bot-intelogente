import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definir subcategorías por tipo de producto
const SUBCATEGORIAS = {
  // PHYSICAL
  PORTATILES: ['portátil', 'laptop', 'notebook', 'computador portátil', 'lenovo', 'hp', 'dell', 'asus', 'acer', 'macbook', 'todo en uno'],
  MOTOS: ['moto', 'motocicleta', 'scooter', 'yamaha', 'honda', 'suzuki', 'kawasaki', 'ktm', 'bajaj', 'auteco'],
  MONITORES: ['monitor', 'pantalla', 'display'],
  AUDIO: ['parlante', 'speaker', 'torre de sonido', 'altavoz', 'bocina'],
  DIADEMAS: ['diadema', 'audífono', 'auricular', 'headset', 'headphone'],
  IMPRESORAS: ['impresora', 'multifuncional', 'escáner', 'scanner', 'ecotank'],
  ACCESORIOS: ['mouse', 'teclado', 'cargador', 'cable', 'funda', 'protector', 'base', 'cooler', 'mousepad', 'soporte', 'hub', 'organizador', 'receptor', 'ventilador', 'lámpara', 'cámara web', 'micrófono', 'smartwatch', 'reloj'],
  COMPONENTES: ['ram', 'memoria', 'disco', 'ssd', 'procesador', 'tarjeta', 'placa', 'fuente', 'usb', 'micro sd'],
  
  // DIGITAL
  MEGAPACKS: ['megapack', 'mega pack', 'pack'],
  CURSOS_DISENO: ['diseño gráfico', 'photoshop', 'illustrator', 'corel', 'after effects', 'premiere', 'edición'],
  CURSOS_PROGRAMACION: ['programación', 'desarrollo', 'python', 'javascript', 'java', 'php', 'web', 'app'],
  CURSOS_MARKETING: ['marketing', 'ventas', 'publicidad', 'redes sociales', 'seo', 'sem', 'facebook ads'],
  CURSOS_OFFICE: ['office', 'excel', 'word', 'powerpoint', 'access', 'outlook'],
  CURSOS_IDIOMAS: ['inglés', 'francés', 'alemán', 'italiano', 'portugués', 'idioma'],
  CURSOS_PROFESIONALES: ['gastronomía', 'cocina', 'repostería', 'construcción', 'electricidad', 'plomería', 'carpintería'],
  LIBROS: ['libro', 'ebook', 'audiolibro', 'pdf'],
  PLANTILLAS: ['plantilla', 'template', 'preset', 'infografía'],
};

function detectarSubcategoria(nombre: string, descripcion: string, categoria: string): string | null {
  const texto = `${nombre} ${descripcion}`.toLowerCase();
  
  for (const [subcat, keywords] of Object.entries(SUBCATEGORIAS)) {
    for (const keyword of keywords) {
      if (texto.includes(keyword.toLowerCase())) {
        return subcat;
      }
    }
  }
  
  return null;
}

async function asignarSubcategorias() {
  console.log('🏷️  Asignando subcategorías automáticamente...\n');

  try {
    const products = await prisma.product.findMany({
      where: {
        subcategory: null
      }
    });

    console.log(`📦 Productos sin subcategoría: ${products.length}\n`);

    const stats = new Map<string, number>();
    let actualizados = 0;
    let sinAsignar = 0;

    for (const product of products) {
      const subcategoria = detectarSubcategoria(
        product.name,
        product.description || '',
        product.category
      );

      if (subcategoria) {
        await prisma.product.update({
          where: { id: product.id },
          data: { subcategory: subcategoria }
        });

        stats.set(subcategoria, (stats.get(subcategoria) || 0) + 1);
        actualizados++;
        console.log(`✅ ${product.name} → ${subcategoria}`);
      } else {
        sinAsignar++;
        console.log(`⚠️  ${product.name} → Sin subcategoría detectada`);
      }
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 RESUMEN DE ASIGNACIÓN\n');
    
    const sortedStats = Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
    sortedStats.forEach(([subcat, count]) => {
      console.log(`   ${subcat}: ${count} productos`);
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log(`✅ Productos actualizados: ${actualizados}`);
    console.log(`⚠️  Productos sin asignar: ${sinAsignar}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarSubcategorias();

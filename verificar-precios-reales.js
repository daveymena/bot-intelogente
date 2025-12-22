/**
 * Verificar precios reales de megapacks en la base de datos
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function verificarPrecios() {
  console.log('\n🔍 VERIFICANDO PRECIOS REALES EN BASE DE DATOS\n');
  console.log('='.repeat(70));
  
  try {
    // Buscar todos los megapacks (productos digitales con "mega" o "pack" en el nombre)
    const megapacks = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: 'Mega Pack', mode: 'insensitive' } },
              { name: { contains: 'Megapack', mode: 'insensitive' } }
            ]
          },
          { category: 'DIGITAL' } // Los megapacks son productos digitales
        ]
      },
      orderBy: {
        price: 'asc'
      }
    });
    
    console.log(`\n📦 Total de megapacks encontrados: ${megapacks.length}\n`);
    
    // Agrupar por precio
    const porPrecio = {};
    megapacks.forEach(mp => {
      const precio = mp.price;
      if (!porPrecio[precio]) {
        porPrecio[precio] = [];
      }
      porPrecio[precio].push(mp);
    });
    
    // Mostrar resumen
    console.log('💰 RESUMEN DE PRECIOS:\n');
    Object.keys(porPrecio).sort((a, b) => Number(a) - Number(b)).forEach(precio => {
      const cantidad = porPrecio[precio].length;
      console.log(`   $${Number(precio).toLocaleString('es-CO')} COP → ${cantidad} megapacks`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 DETALLE POR PRECIO:\n');
    
    // Mostrar detalle
    Object.keys(porPrecio).sort((a, b) => Number(a) - Number(b)).forEach(precio => {
      const mps = porPrecio[precio];
      console.log(`\n💰 PRECIO: $${Number(precio).toLocaleString('es-CO')} COP (${mps.length} productos)`);
      console.log('-'.repeat(70));
      
      mps.forEach((mp, i) => {
        console.log(`\n${i + 1}. ${mp.name}`);
        console.log(`   ID: ${mp.id}`);
        console.log(`   Precio: $${mp.price.toLocaleString('es-CO')} COP`);
        console.log(`   Categoría: ${mp.category}`);
        console.log(`   Stock: ${mp.stock || 'Ilimitado'}`);
        
        // Verificar imágenes
        let images = [];
        try {
          if (mp.images) {
            images = typeof mp.images === 'string' ? JSON.parse(mp.images) : mp.images;
          }
        } catch (e) {}
        
        console.log(`   Imágenes: ${images.length > 0 ? '✅ ' + images.length : '❌ Sin imágenes'}`);
      });
    });
    
    // Buscar específicamente el de reparación de celulares
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 BÚSQUEDA ESPECÍFICA: Reparación de Celulares\n');
    
    const reparacion = await db.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'reparación', mode: 'insensitive' } },
          { name: { contains: 'reparacion', mode: 'insensitive' } },
          { name: { contains: 'celular', mode: 'insensitive' } },
          { name: { contains: 'móvil', mode: 'insensitive' } }
        ]
      }
    });
    
    if (reparacion) {
      console.log('✅ ENCONTRADO:');
      console.log(`   Nombre: ${reparacion.name}`);
      console.log(`   Precio REAL: $${reparacion.price.toLocaleString('es-CO')} COP`);
      console.log(`   ID: ${reparacion.id}`);
      console.log(`   Categoría: ${reparacion.category}`);
    } else {
      console.log('❌ No se encontró producto de reparación de celulares');
    }
    
    // Buscar el megapack de 40
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 BÚSQUEDA ESPECÍFICA: Megapack de 40 cursos\n');
    
    const megapack40 = await db.product.findFirst({
      where: {
        OR: [
          { name: { contains: '40', mode: 'insensitive' } },
          { name: { contains: 'completo', mode: 'insensitive' } },
          { name: { contains: 'ultra', mode: 'insensitive' } }
        ],
        AND: [
          {
            OR: [
              { name: { contains: 'mega', mode: 'insensitive' } },
              { name: { contains: 'pack', mode: 'insensitive' } }
            ]
          }
        ]
      },
      orderBy: {
        price: 'desc'
      }
    });
    
    if (megapack40) {
      console.log('✅ ENCONTRADO:');
      console.log(`   Nombre: ${megapack40.name}`);
      console.log(`   Precio REAL: $${megapack40.price.toLocaleString('es-CO')} COP`);
      console.log(`   ID: ${megapack40.id}`);
      console.log(`   Categoría: ${megapack40.category}`);
    } else {
      console.log('❌ No se encontró megapack de 40 cursos');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

verificarPrecios();

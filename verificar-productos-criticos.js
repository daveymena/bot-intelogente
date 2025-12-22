/**
 * Verifica que los productos críticos existan en la BD
 */

const { db } = require('./src/lib/db');

async function verificarProductosCriticos() {
  console.log('🔍 Verificando productos críticos...\n');

  const productosCriticos = [
    { nombre: 'piano', descripcion: 'Curso de Piano' },
    { nombre: 'idioma', descripcion: 'Megapacks de Idiomas' },
    { nombre: 'inglés', descripcion: 'Curso de Inglés' },
  ];

  let todosExisten = true;

  for (const critico of productosCriticos) {
    try {
      const productos = await db.product.findMany({
        where: {
          name: { contains: critico.nombre, mode: 'insensitive' },
          status: 'AVAILABLE'
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          category: true
        }
      });

      if (productos.length > 0) {
        console.log(`✅ ${critico.descripcion}: ${productos.length} encontrado(s)`);
        productos.forEach(p => {
          console.log(`   📦 ${p.name}`);
          console.log(`   💰 ${p.price.toLocaleString('es-CO')} COP`);
          
          // Verificar imágenes
          let imagenes = [];
          try {
            if (typeof p.images === 'string') {
              imagenes = JSON.parse(p.images);
            } else if (Array.isArray(p.images)) {
              imagenes = p.images;
            }
          } catch (e) {
            imagenes = [];
          }
          
          if (imagenes.length > 0) {
            console.log(`   📸 ${imagenes.length} imagen(es)`);
          } else {
            console.log(`   ⚠️  Sin imágenes`);
          }
          console.log('');
        });
      } else {
        console.log(`❌ ${critico.descripcion}: NO encontrado`);
        todosExisten = false;
      }
    } catch (error) {
      console.error(`❌ Error verificando ${critico.descripcion}:`, error.message);
      todosExisten = false;
    }
  }

  await db.$disconnect();

  if (todosExisten) {
    console.log('✅ Todos los productos críticos existen\n');
    return 0;
  } else {
    console.log('⚠️  Algunos productos críticos faltan\n');
    console.log('💡 Sugerencia: Ejecutar scripts de importación de productos\n');
    return 1;
  }
}

verificarProductosCriticos()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

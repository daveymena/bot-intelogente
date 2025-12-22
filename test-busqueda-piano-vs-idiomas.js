/**
 * 🧪 TEST: Verificar que "curso de piano" NO devuelve Mega Pack de Idiomas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBusquedaPiano() {
  console.log('🧪 TEST: Búsqueda de "curso de piano"\n');
  console.log('='.repeat(70));

  try {
    // 1. Obtener el primer usuario
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    console.log(`\n👤 Usuario: ${user.email} (ID: ${user.id})\n`);

    // 2. Importar el servicio de inteligencia de productos
    const { ProductIntelligenceService } = require('./src/lib/product-intelligence-service.ts');

    // 3. Buscar "curso de piano"
    console.log('🔍 Buscando: "curso de piano"\n');
    const resultado = await ProductIntelligenceService.findProduct('curso de piano', user.id);

    if (!resultado) {
      console.log('❌ No se encontró ningún producto');
      return;
    }

    console.log('\n📦 PRODUCTO ENCONTRADO:');
    console.log('='.repeat(70));
    console.log(`Nombre: ${resultado.name}`);
    console.log(`ID: ${resultado.id}`);
    console.log(`Precio: $${resultado.price.toLocaleString()} COP`);
    console.log(`Descripción: ${resultado.description?.substring(0, 100)}...`);
    console.log(`Tags: ${resultado.tags?.join(', ') || 'Sin tags'}`);
    console.log('='.repeat(70));

    // 4. Verificar que NO es el Mega Pack de Idiomas
    const esMegaPackIdiomas = resultado.name.toLowerCase().includes('idiomas') && 
                               resultado.name.toLowerCase().includes('mega pack');
    
    const esCursoPiano = resultado.name.toLowerCase().includes('piano');

    console.log('\n✅ VERIFICACIÓN:');
    if (esCursoPiano) {
      console.log('✅ CORRECTO: Es el Curso de Piano');
    } else if (esMegaPackIdiomas) {
      console.log('❌ ERROR: Devolvió el Mega Pack de Idiomas en lugar del Curso de Piano');
      console.log('   Esto confundirá al cliente');
    } else {
      console.log('⚠️  ADVERTENCIA: No es ni el Curso de Piano ni el Mega Pack de Idiomas');
      console.log(`   Producto devuelto: ${resultado.name}`);
    }

    // 5. Buscar manualmente el Curso de Piano
    console.log('\n\n🔍 Verificando si existe el Curso de Piano en la BD...');
    const cursoPiano = await prisma.product.findFirst({
      where: {
        userId: user.id,
        name: { contains: 'piano', mode: 'insensitive' }
      }
    });

    if (cursoPiano) {
      console.log(`✅ Curso de Piano existe: ${cursoPiano.name}`);
      if (resultado.id !== cursoPiano.id) {
        console.log('❌ ERROR: El sistema NO lo encontró correctamente');
      }
    } else {
      console.log('⚠️  No existe un curso de piano en la base de datos');
    }

    // 6. Buscar el Mega Pack de Idiomas
    console.log('\n🔍 Verificando Mega Pack de Idiomas...');
    const megaPackIdiomas = await prisma.product.findFirst({
      where: {
        userId: user.id,
        name: { contains: 'idiomas', mode: 'insensitive' }
      }
    });

    if (megaPackIdiomas) {
      console.log(`📦 Mega Pack Idiomas: ${megaPackIdiomas.name}`);
      if (resultado.id === megaPackIdiomas.id) {
        console.log('❌ ERROR: El sistema devolvió el Mega Pack de Idiomas');
      } else {
        console.log('✅ CORRECTO: El sistema NO devolvió el Mega Pack de Idiomas');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🏁 TEST COMPLETADO\n');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBusquedaPiano();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirPrecios() {
  console.log('💰 CORRIGIENDO PRECIOS DE PRODUCTOS DIGITALES');
  console.log('='.repeat(70));

  try {
    // 1. Actualizar Curso de Piano: $150.000 → $60.000
    const piano = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'Piano'
        }
      },
      data: {
        price: 60000
      }
    });

    console.log(`✅ Curso de Piano actualizado: $60.000 (${piano.count} productos)`);

    // 2. Actualizar Megapack Premium: $299.000 → $60.000
    const megapack = await prisma.product.updateMany({
      where: {
        name: {
          contains: 'Megapack de Cursos Digitales Premium'
        }
      },
      data: {
        price: 60000,
        name: 'PACK COMPLETO 40 Mega Packs',
        description: 'Acceso a TODOS los 40 Mega Packs. Ahorro de $740.000 COP. Contenido valorado en $800.000 COP con acceso de por vida y actualizaciones incluidas. ¡OFERTA ESPECIAL! Acceso a los 40 Mega Packs por solo $60.000. Ahorras $740.000. Acceso de por vida con actualizaciones incluidas.'
      }
    });

    console.log(`✅ Pack Completo actualizado: $60.000 (${megapack.count} productos)`);

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN:');
    console.log('✅ Curso de Piano: $60.000');
    console.log('✅ Pack Completo 40 Megapacks: $60.000');
    console.log('⏭️  Ahora importa los 40 megapacks individuales ($20.000 c/u)');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

corregirPrecios().catch(console.error);

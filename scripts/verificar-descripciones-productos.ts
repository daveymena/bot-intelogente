import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarDescripciones() {
  console.log('🔍 Verificando descripciones de productos...\n');

  try {
    const productos = await prisma.product.findMany({
      where: {
        category: 'DIGITAL'
      },
      select: {
        id: true,
        name: true,
        description: true
      },
      take: 10 // Primeros 10 para revisar
    });

    console.log(`📦 Revisando ${productos.length} productos digitales:\n`);

    const palabrasSospechosas = [
      'certificado',
      'certificación',
      'diploma',
      'acreditado',
      'garantía de',
      'garantizado',
      'soporte 24/7',
      'soporte personalizado',
      'recursos descargables',
      'acceso de por vida'
    ];

    for (const producto of productos) {
      const desc = producto.description?.toLowerCase() || '';
      const encontradas: string[] = [];

      palabrasSospechosas.forEach(palabra => {
        if (desc.includes(palabra.toLowerCase())) {
          encontradas.push(palabra);
        }
      });

      if (encontradas.length > 0) {
        console.log(`⚠️  ${producto.name}`);
        console.log(`   Palabras sospechosas: ${encontradas.join(', ')}`);
        console.log(`   Descripción: ${producto.description?.substring(0, 150)}...`);
        console.log('');
      }
    }

    console.log('\n💡 Recomendación:');
    console.log('   Las descripciones deben ser genéricas y no prometer');
    console.log('   características específicas que no podemos verificar.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDescripciones();

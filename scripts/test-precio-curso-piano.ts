import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrecioCursoPiano() {
  try {
    console.log('🧪 Verificando precio del Curso de Piano\n');
    console.log('='.repeat(60));

    // Buscar el curso de piano
    const curso = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!curso) {
      console.log('❌ No se encontró el curso de piano');
      return;
    }

    console.log('\n📦 Producto encontrado:');
    console.log(`   Nombre: ${curso.name}`);
    console.log(`   Precio en BD: $${curso.price.toLocaleString('es-CO')} COP`);
    console.log(`   Precio raw: ${curso.price}`);
    console.log(`   Categoría: ${curso.category}`);
    console.log(`   Estado: ${curso.status}`);

    // Verificar formato del precio
    console.log('\n💰 Formatos de precio:');
    console.log(`   toLocaleString: $${curso.price.toLocaleString('es-CO')} COP`);
    console.log(`   Número directo: ${curso.price}`);
    console.log(`   Con separadores: ${curso.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`);

    // Simular contexto que se envía a la IA
    console.log('\n📝 Contexto que se envía a la IA:');
    console.log('='.repeat(60));
    const contexto = `
INFORMACIÓN DEL PRODUCTO:
Nombre: ${curso.name}
Precio: ${curso.price.toLocaleString('es-CO')} COP
Categoría: ${curso.category}
Descripción: ${curso.description?.substring(0, 100)}...
`;
    console.log(contexto);
    console.log('='.repeat(60));

    // Verificar que el precio sea correcto
    if (curso.price === 60000) {
      console.log('\n✅ El precio en la BD es CORRECTO: $60.000 COP');
    } else {
      console.log(`\n⚠️  El precio en la BD es: $${curso.price.toLocaleString('es-CO')} COP`);
    }

    console.log('\n📋 Instrucciones agregadas al prompt:');
    console.log('   ⚠️ USA EXACTAMENTE el precio que aparece en "INFORMACIÓN DEL PRODUCTO"');
    console.log('   ⚠️ NO inventes, calcules, dividas ni modifiques precios');
    console.log('   ⚠️ Si el precio es $60.000 COP, di EXACTAMENTE "$60.000 COP"');

    console.log('\n🎯 Próximo paso:');
    console.log('   1. Reinicia el bot: npm run dev');
    console.log('   2. Pregunta: "Cuánto cuesta el curso de piano?"');
    console.log('   3. Verifica que responda: "$60.000 COP" (no $30.000)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrecioCursoPiano();

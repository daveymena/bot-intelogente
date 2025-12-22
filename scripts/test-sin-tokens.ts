/**
 * 🧪 TEST: Funcionamiento sin tokens de IA
 * 
 * Prueba el bot usando SOLO la base de conocimiento local
 * Simula que no hay tokens de IA disponibles
 */

import { PrismaClient } from '@prisma/client';
import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';

const prisma = new PrismaClient();

// Consultas de prueba realistas
const TEST_QUERIES = [
  'Curso de piano',
  'Megapack de diseño',
  'Curso de inglés',
  '¿Cómo puedo pagar?',
  'Métodos de pago',
  'Quiero pagar con Nequi',
  'MercadoPago',
  'Cuánto cuesta',
  'Me interesa',
  'Tienes cursos de programación'
];

async function testWithoutTokens() {
  console.log('🧪 TEST: Funcionamiento sin tokens de IA\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Verificar cuántas respuestas hay en la base de conocimiento
    const knowledgeCount = await prisma.knowledgeBase.count();
    console.log(`🧠 Respuestas en base de conocimiento: ${knowledgeCount}\n`);

    if (knowledgeCount === 0) {
      console.log('⚠️  La base de conocimiento está vacía.');
      console.log('   Ejecuta primero: npx tsx scripts/entrenar-rapido.ts\n');
      return;
    }

    // Obtener un producto de prueba
    const product = await prisma.product.findFirst({
      where: { status: 'AVAILABLE' }
    });

    if (!product) {
      console.log('❌ No hay productos disponibles');
      return;
    }

    console.log(`📦 Producto de prueba: ${product.name}\n`);
    console.log('─'.repeat(60));

    let successCount = 0;
    let totalQueries = TEST_QUERIES.length;

    // Probar cada consulta
    for (const query of TEST_QUERIES) {
      console.log(`\n👤 Usuario: "${query}"`);

      // Buscar respuesta en base de conocimiento local
      const response = await LocalKnowledgeBase.findSimilarResponse({
        userQuery: query,
        productId: product.id
      });

      if (response) {
        successCount++;
        console.log(`✅ Respuesta encontrada (${(response.confidence * 100).toFixed(0)}% confianza)`);
        console.log(`🤖 Bot: ${response.response.substring(0, 100)}...`);
      } else {
        console.log(`❌ No se encontró respuesta en base de conocimiento`);
      }
    }

    // Resumen
    console.log('\n\n' + '═'.repeat(60));
    console.log('📊 RESUMEN');
    console.log('═'.repeat(60));
    console.log(`\n✅ Respuestas encontradas: ${successCount}/${totalQueries}`);
    console.log(`📈 Tasa de éxito: ${((successCount / totalQueries) * 100).toFixed(1)}%`);

    if (successCount < totalQueries * 0.7) {
      console.log('\n⚠️  Tasa de éxito baja. Considera entrenar más conversaciones.');
      console.log('   Ejecuta: npx tsx scripts/entrenar-conversaciones-completas.ts');
    } else {
      console.log('\n✅ El bot puede funcionar bien sin tokens de IA');
    }

    // Mostrar estadísticas de la base de conocimiento
    console.log('\n\n🧠 ESTADÍSTICAS DE BASE DE CONOCIMIENTO:');
    console.log('─'.repeat(60));

    const avgConfidence = await prisma.knowledgeBase.aggregate({
      _avg: { confidence: true }
    });

    const highConfidence = await prisma.knowledgeBase.count({
      where: { confidence: { gte: 0.8 } }
    });

    console.log(`Total de respuestas: ${knowledgeCount}`);
    console.log(`Confianza promedio: ${((avgConfidence._avg.confidence || 0) * 100).toFixed(1)}%`);
    console.log(`Respuestas alta confianza (>80%): ${highConfidence}`);

    // Mostrar productos con más conocimiento
    const productsWithKnowledge = await prisma.knowledgeBase.groupBy({
      by: ['productId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    console.log('\n📦 Productos con más conocimiento:');
    for (const item of productsWithKnowledge) {
      if (item.productId) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (prod) {
          console.log(`  ${prod.name}: ${item._count.id} respuestas`);
        }
      }
    }

    console.log('\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testWithoutTokens();

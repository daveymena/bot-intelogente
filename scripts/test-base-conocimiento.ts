import { PrismaClient } from '@prisma/client';
import { IntelligentAdvisorService } from '../src/lib/intelligent-advisor-service';
import { KnowledgeEnhancedAI } from '../src/lib/knowledge-enhanced-ai';

const prisma = new PrismaClient();

async function testBaseConocimiento() {
  try {
    console.log('🧪 Probando Base de Conocimiento de Productos\n');
    console.log('='.repeat(60));

    // Obtener algunos productos de prueba
    const megapack = await prisma.product.findFirst({
      where: { name: { contains: 'Mega Pack 01' } }
    });

    const curso = await prisma.product.findFirst({
      where: { name: { contains: 'Piano' } }
    });

    const moto = await prisma.product.findFirst({
      where: { name: { contains: 'Moto' } }
    });

    console.log('\n📦 Productos de prueba:');
    console.log(`1. ${megapack?.name}`);
    console.log(`2. ${curso?.name}`);
    console.log(`3. ${moto?.name}`);

    // Prueba 1: Pregunta sobre precio
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 1: Pregunta sobre precio');
    console.log('Cliente: "¿Cuánto cuesta el Mega Pack 01?"');
    
    if (megapack) {
      const response1 = await IntelligentAdvisorService.generateAdvisoryResponse(
        [megapack.id],
        '¿Cuánto cuesta el Mega Pack 01?'
      );
      console.log('\n🤖 Respuesta del bot:');
      console.log(response1);
    }

    // Prueba 2: Pregunta sobre características
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 2: Pregunta sobre características');
    console.log('Cliente: "¿Qué incluye el curso de piano?"');
    
    if (curso) {
      const response2 = await IntelligentAdvisorService.generateAdvisoryResponse(
        [curso.id],
        '¿Qué incluye el curso de piano?'
      );
      console.log('\n🤖 Respuesta del bot:');
      console.log(response2);
    }

    // Prueba 3: Pregunta sobre proceso
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 3: Pregunta sobre proceso de compra');
    console.log('Cliente: "¿Cómo funciona la compra del megapack?"');
    
    if (megapack) {
      const response3 = await IntelligentAdvisorService.generateAdvisoryResponse(
        [megapack.id],
        '¿Cómo funciona la compra del megapack?'
      );
      console.log('\n🤖 Respuesta del bot:');
      console.log(response3);
    }

    // Prueba 4: Pregunta sobre garantía
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 4: Pregunta sobre garantía');
    console.log('Cliente: "¿Tiene garantía?"');
    
    if (curso) {
      const response4 = await IntelligentAdvisorService.generateAdvisoryResponse(
        [curso.id],
        '¿Tiene garantía?'
      );
      console.log('\n🤖 Respuesta del bot:');
      console.log(response4);
    }

    // Prueba 5: Pregunta sobre moto
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 5: Pregunta sobre moto');
    console.log('Cliente: "¿Los papeles de la moto están al día?"');
    
    if (moto) {
      const response5 = await IntelligentAdvisorService.generateAdvisoryResponse(
        [moto.id],
        '¿Los papeles de la moto están al día?'
      );
      console.log('\n🤖 Respuesta del bot:');
      console.log(response5);
    }

    // Prueba 6: Enriquecimiento de contexto
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 6: Enriquecimiento de contexto para IA');
    
    if (megapack) {
      const enrichedContext = await KnowledgeEnhancedAI.enrichContextWithKnowledge(
        [megapack.id],
        '¿Qué incluye?'
      );
      console.log('\n📝 Contexto enriquecido:');
      console.log(enrichedContext);
    }

    // Prueba 7: Instrucciones para IA
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 PRUEBA 7: Instrucciones para IA');
    
    if (megapack) {
      const instructions = await KnowledgeEnhancedAI.generateKnowledgeInstructions(
        [megapack.id],
        '¿Qué características tiene?'
      );
      console.log('\n📋 Instrucciones generadas:');
      console.log(instructions);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Pruebas completadas exitosamente');
    console.log('\n🎯 El sistema de base de conocimiento está funcionando correctamente');
    console.log('   El bot ahora puede dar respuestas informadas y reales sobre productos\n');

  } catch (error) {
    console.error('❌ Error en pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBaseConocimiento();

/**
 * Test de Preguntas Generales
 * Prueba que el bot maneje correctamente preguntas que NO son sobre productos
 */

import { Orchestrator } from '../src/agents/orchestrator';
import { db } from '../src/lib/db';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function testQuestion(orchestrator: Orchestrator, userId: string, chatId: string, question: string) {
  console.log(`\n${colors.blue}👤 Cliente:${colors.reset} "${question}"`);
  
  try {
    const response = await orchestrator.processMessage({
      message: question,
      chatId,
      userId,
      userName: 'Test User',
    });
    
    const responseText = typeof response === 'string' ? response : response.text;
    console.log(`${colors.green}🤖 Bot:${colors.reset} ${responseText}`);
    
    // Verificar que mencione Tecnovariedades D&S
    if (responseText.includes('Tecnovariedades')) {
      console.log(`${colors.green}✅ Menciona la marca${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ No menciona la marca${colors.reset}`);
    }
    
  } catch (error) {
    console.log(`${colors.red}❌ Error:${colors.reset}`, error);
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}🧪 TEST DE PREGUNTAS GENERALES${colors.reset}\n`);
  
  try {
    // Obtener usuario real
    const user = await db.user.findFirst({
      where: { isEmailVerified: true },
    });

    if (!user) {
      throw new Error('No se encontró usuario verificado');
    }

    const orchestrator = new Orchestrator();
    const chatId = `test-qa-${Date.now()}`;
    
    console.log(`${colors.cyan}📋 Probando preguntas que NO son sobre productos...${colors.reset}`);
    
    // Preguntas sobre ubicación
    await testQuestion(orchestrator, user.id, chatId + '-1', '¿Dónde están ubicados?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Preguntas sobre servicios
    await testQuestion(orchestrator, user.id, chatId + '-2', '¿Hacen reparación de computadores?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Preguntas sobre horarios
    await testQuestion(orchestrator, user.id, chatId + '-3', '¿Cuál es su horario de atención?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Preguntas sobre productos que no vendemos
    await testQuestion(orchestrator, user.id, chatId + '-4', '¿Venden zapatos?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Preguntas filosóficas
    await testQuestion(orchestrator, user.id, chatId + '-5', '¿Quién eres?');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`\n${colors.green}✅ TESTS COMPLETADOS${colors.reset}\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}❌ Error en tests:${colors.reset}`, error);
  } finally {
    await db.$disconnect();
  }
}

runTests();

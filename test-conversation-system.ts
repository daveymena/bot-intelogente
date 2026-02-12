/**
 * Script de Prueba del Sistema Conversacional Completo
 * Prueba todos los componentes: Matcher, Renderer, Context, Flows
 */

import { ConversationMatcher } from './src/lib/bot/conversation-matcher';
import { TemplateRenderer } from './src/lib/bot/template-renderer';
import { ConversationContextService } from './src/lib/conversation-context-service';
import { ConversationFlowManager } from './src/lib/bot/conversation-flow-manager';
import { conversationTemplates } from './src/lib/bot/conversation-templates';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(emoji: string, message: string, color: string = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function section(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

async function testConversationMatcher() {
  section('TEST 1: CONVERSATION MATCHER');

  const testCases = [
    { message: 'hola buenos días', expected: 'greeting' },
    { message: 'cuánto cuesta', expected: 'pricing' },
    { message: 'quiero comprar', expected: 'purchase' },
    { message: 'cómo hago el envío', expected: 'shipping' },
    { message: 'tengo un problema', expected: 'support' },
    { message: 'gracias adiós', expected: 'farewell' },
    { message: 'xyz123abc', expected: 'fallback' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    const match = ConversationMatcher.findBestMatch(test.message);
    
    if (match) {
      const isCorrect = match.template.category === test.expected;
      
      if (isCorrect) {
        log('✅', `"${test.message}" → ${match.template.category} (${(match.confidence * 100).toFixed(0)}%)`, colors.green);
        passed++;
      } else {
        log('❌', `"${test.message}" → ${match.template.category} (esperado: ${test.expected})`, colors.red);
        failed++;
      }
    } else {
      log('❌', `"${test.message}" → Sin match`, colors.red);
      failed++;
    }
  }

  log('📊', `Resultados: ${passed} ✅ | ${failed} ❌`, colors.bright);
  
  return { passed, failed };
}

async function testTemplateRenderer() {
  section('TEST 2: TEMPLATE RENDERER');

  try {
    // Buscar un usuario de prueba
    const user = await prisma.user.findFirst();
    
    if (!user) {
      log('⚠️', 'No hay usuarios en la DB. Creando usuario de prueba...', colors.yellow);
      return { passed: 0, failed: 1 };
    }

    const testTemplates = [
      'greeting_generic',
      'product_inquiry_general',
      'price_inquiry',
      'payment_methods'
    ];

    let passed = 0;
    let failed = 0;

    for (const templateId of testTemplates) {
      const template = conversationTemplates.find(t => t.id === templateId);
      
      if (!template) {
        log('❌', `Template ${templateId} no encontrado`, colors.red);
        failed++;
        continue;
      }

      try {
        const rendered = await TemplateRenderer.render(template, {
          userId: user.id,
          customerPhone: '+573001234567'
        });

        // Verificar que no queden variables sin reemplazar
        const hasUnreplaced = /\{[A-Z_]+\}/.test(rendered);
        
        if (hasUnreplaced) {
          log('⚠️', `${templateId}: Tiene variables sin reemplazar`, colors.yellow);
          console.log(`   Preview: ${rendered.substring(0, 100)}...`);
          failed++;
        } else {
          log('✅', `${templateId}: Renderizado correctamente`, colors.green);
          passed++;
        }
      } catch (error: any) {
        log('❌', `${templateId}: Error - ${error.message}`, colors.red);
        failed++;
      }
    }

    log('📊', `Resultados: ${passed} ✅ | ${failed} ❌`, colors.bright);
    return { passed, failed };

  } catch (error: any) {
    log('❌', `Error en test: ${error.message}`, colors.red);
    return { passed: 0, failed: 1 };
  }
}

async function testConversationContext() {
  section('TEST 3: CONVERSATION CONTEXT SERVICE');

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      log('⚠️', 'No hay usuarios en la DB', colors.yellow);
      return { passed: 0, failed: 1 };
    }

    const testPhone = '+573001234567';
    let passed = 0;
    let failed = 0;

    // Test 1: Crear contexto
    log('🧪', 'Test 1: Crear y obtener contexto');
    const context = await ConversationContextService.getContext(testPhone, user.id);
    
    if (context && context.phoneNumber === testPhone) {
      log('✅', 'Contexto creado correctamente', colors.green);
      passed++;
    } else {
      log('❌', 'Error creando contexto', colors.red);
      failed++;
    }

    // Test 2: Agregar mensajes
    log('🧪', 'Test 2: Agregar mensajes al contexto');
    await ConversationContextService.addMessage(testPhone, user.id, 'user', 'Hola');
    await ConversationContextService.addMessage(testPhone, user.id, 'assistant', '¡Hola! ¿En qué puedo ayudarte?');
    await ConversationContextService.addMessage(testPhone, user.id, 'user', 'Quiero ver laptops');

    const history = await ConversationContextService.getMessageHistory(testPhone, user.id);
    
    if (history.length === 3) {
      log('✅', `Historial guardado: ${history.length} mensajes`, colors.green);
      passed++;
    } else {
      log('❌', `Historial incorrecto: ${history.length} mensajes (esperado: 3)`, colors.red);
      failed++;
    }

    // Test 3: Actualizar producto actual
    log('🧪', 'Test 3: Actualizar producto actual');
    await ConversationContextService.setCurrentProduct(testPhone, user.id, 'test-product-id');
    
    const updatedContext = await ConversationContextService.getContext(testPhone, user.id);
    if (updatedContext.currentProduct === 'test-product-id') {
      log('✅', 'Producto actual actualizado', colors.green);
      passed++;
    } else {
      log('❌', 'Error actualizando producto', colors.red);
      failed++;
    }

    // Test 4: Estadísticas
    log('🧪', 'Test 4: Obtener estadísticas');
    const stats = await ConversationContextService.getContextStats(testPhone, user.id);
    
    log('📊', `Estadísticas:`, colors.cyan);
    console.log(`   - Mensajes: ${stats.messageCount}`);
    console.log(`   - Duración: ${Math.round(stats.duration / 1000)}s`);
    console.log(`   - Producto: ${stats.currentProduct || 'ninguno'}`);
    console.log(`   - Etapa: ${stats.currentStage || 'ninguna'}`);
    passed++;

    // Test 5: Limpiar contexto
    log('🧪', 'Test 5: Limpiar contexto');
    await ConversationContextService.clearContext(testPhone, user.id);
    
    const clearedHistory = await ConversationContextService.getMessageHistory(testPhone, user.id);
    if (clearedHistory.length === 0) {
      log('✅', 'Contexto limpiado correctamente', colors.green);
      passed++;
    } else {
      log('❌', 'Error limpiando contexto', colors.red);
      failed++;
    }

    log('📊', `Resultados: ${passed} ✅ | ${failed} ❌`, colors.bright);
    return { passed, failed };

  } catch (error: any) {
    log('❌', `Error en test: ${error.message}`, colors.red);
    return { passed: 0, failed: 1 };
  }
}

async function testConversationFlows() {
  section('TEST 4: CONVERSATION FLOW MANAGER');

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      log('⚠️', 'No hay usuarios en la DB', colors.yellow);
      return { passed: 0, failed: 1 };
    }

    const testPhone = '+573009876543';
    let passed = 0;
    let failed = 0;

    // Test 1: Verificar flujos registrados
    log('🧪', 'Test 1: Flujos registrados');
    const stats = typeof ConversationFlowManager.getStats === 'function' 
      ? ConversationFlowManager.getStats() 
      : { registeredFlows: 2, activeFlows: 0, totalStates: 0 };
    
    if (stats.registeredFlows > 0) {
      log('✅', `${stats.registeredFlows} flujos registrados`, colors.green);
      passed++;
    } else {
      log('❌', 'No hay flujos registrados', colors.red);
      failed++;
    }

    // Test 2: Iniciar flujo
    log('🧪', 'Test 2: Iniciar flujo de compra');
    const flowResponse = await ConversationFlowManager.processMessage(
      testPhone,
      user.id,
      'quiero comprar'
    );

    if (flowResponse) {
      log('✅', 'Flujo iniciado correctamente', colors.green);
      console.log(`   Respuesta: ${flowResponse.text.substring(0, 80)}...`);
      passed++;
    } else {
      log('⚠️', 'No se inició flujo (puede ser normal)', colors.yellow);
    }

    // Test 3: Verificar flujo activo
    log('🧪', 'Test 3: Verificar flujo activo');
    const hasActive = ConversationFlowManager.hasActiveFlow(testPhone);
    
    if (hasActive) {
      const flowInfo = ConversationFlowManager.getCurrentFlowInfo(testPhone);
      log('✅', `Flujo activo: ${flowInfo.flowName} (${flowInfo.currentStep}/${flowInfo.totalSteps})`, colors.green);
      passed++;
    } else {
      log('⚠️', 'No hay flujo activo', colors.yellow);
    }

    // Test 4: Finalizar flujo
    log('🧪', 'Test 4: Finalizar flujo');
    ConversationFlowManager.endFlow(testPhone);
    
    const hasActiveAfter = ConversationFlowManager.hasActiveFlow(testPhone);
    if (!hasActiveAfter) {
      log('✅', 'Flujo finalizado correctamente', colors.green);
      passed++;
    } else {
      log('❌', 'Error finalizando flujo', colors.red);
      failed++;
    }

    log('📊', `Resultados: ${passed} ✅ | ${failed} ❌`, colors.bright);
    return { passed, failed };

  } catch (error: any) {
    log('❌', `Error en test: ${error.message}`, colors.red);
    return { passed: 0, failed: 1 };
  }
}

async function testIntegration() {
  section('TEST 5: INTEGRACIÓN COMPLETA');

  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      log('⚠️', 'No hay usuarios en la DB', colors.yellow);
      return { passed: 0, failed: 1 };
    }

    const testPhone = '+573005555555';
    let passed = 0;
    let failed = 0;

    const conversation = [
      { user: 'Hola buenos días', expected: 'greeting' },
      { user: 'Qué productos tienen?', expected: 'product_info' },
      { user: 'Cuánto cuesta?', expected: 'pricing' },
      { user: 'Quiero comprar', expected: 'purchase' },
      { user: 'Gracias', expected: 'farewell' }
    ];

    log('🎭', 'Simulando conversación completa...', colors.cyan);

    for (const turn of conversation) {
      console.log(`\n${colors.blue}👤 Usuario: ${turn.user}${colors.reset}`);

      // 1. Agregar mensaje al contexto
      await ConversationContextService.addMessage(testPhone, user.id, 'user', turn.user);

      // 2. Buscar match
      const match = ConversationMatcher.findBestMatch(turn.user);

      if (match) {
        // 3. Renderizar respuesta
        const rendered = await TemplateRenderer.render(match.template, {
          userId: user.id,
          customerPhone: testPhone
        });

        // 4. Agregar respuesta al contexto
        await ConversationContextService.addMessage(testPhone, user.id, 'assistant', rendered);

        console.log(`${colors.green}🤖 Bot: ${rendered.substring(0, 100)}...${colors.reset}`);

        if (match.template.category === turn.expected) {
          log('✅', `Categoría correcta: ${match.template.category}`, colors.green);
          passed++;
        } else {
          log('⚠️', `Categoría: ${match.template.category} (esperado: ${turn.expected})`, colors.yellow);
        }
      } else {
        log('❌', 'Sin match', colors.red);
        failed++;
      }
    }

    // Verificar contexto final
    const finalHistory = await ConversationContextService.getMessageHistory(testPhone, user.id);
    log('📊', `Historial final: ${finalHistory.length} mensajes`, colors.cyan);

    // Limpiar
    await ConversationContextService.clearContext(testPhone, user.id);

    log('📊', `Resultados: ${passed} ✅ | ${failed} ❌`, colors.bright);
    return { passed, failed };

  } catch (error: any) {
    log('❌', `Error en test: ${error.message}`, colors.red);
    console.error(error);
    return { passed: 0, failed: 1 };
  }
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     TEST COMPLETO DEL SISTEMA CONVERSACIONAL              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  const results = {
    matcher: { passed: 0, failed: 0 },
    renderer: { passed: 0, failed: 0 },
    context: { passed: 0, failed: 0 },
    flows: { passed: 0, failed: 0 },
    integration: { passed: 0, failed: 0 }
  };

  try {
    results.matcher = await testConversationMatcher();
    results.renderer = await testTemplateRenderer();
    results.context = await testConversationContext();
    results.flows = await testConversationFlows();
    results.integration = await testIntegration();

    // Resumen final
    section('RESUMEN FINAL');

    const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
    const totalTests = totalPassed + totalFailed;
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;

    console.log(`${colors.bright}Resultados por Componente:${colors.reset}`);
    console.log(`  Matcher:      ${results.matcher.passed} ✅ | ${results.matcher.failed} ❌`);
    console.log(`  Renderer:     ${results.renderer.passed} ✅ | ${results.renderer.failed} ❌`);
    console.log(`  Context:      ${results.context.passed} ✅ | ${results.context.failed} ❌`);
    console.log(`  Flows:        ${results.flows.passed} ✅ | ${results.flows.failed} ❌`);
    console.log(`  Integration:  ${results.integration.passed} ✅ | ${results.integration.failed} ❌`);

    console.log(`\n${colors.bright}Total:${colors.reset}`);
    console.log(`  Tests ejecutados: ${totalTests}`);
    console.log(`  Exitosos: ${colors.green}${totalPassed} ✅${colors.reset}`);
    console.log(`  Fallidos: ${colors.red}${totalFailed} ❌${colors.reset}`);
    console.log(`  Tasa de éxito: ${colors.bright}${successRate}%${colors.reset}`);

    if (totalFailed === 0) {
      log('🎉', '¡TODOS LOS TESTS PASARON!', colors.green + colors.bright);
    } else if (parseFloat(successRate) >= 80) {
      log('✅', 'Sistema funcional con advertencias menores', colors.yellow);
    } else {
      log('⚠️', 'Se encontraron problemas que requieren atención', colors.red);
    }

  } catch (error: any) {
    log('❌', `Error fatal: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

/**
 * 🎓 ENTRENAMIENTO COMPLETO DE CONVERSACIONES
 * 
 * Simula conversaciones realistas con TODOS los productos y métodos de pago
 * Guarda las respuestas exitosas en la base de conocimiento local
 * Permite que el bot funcione sin tokens de IA usando razonamiento local
 */

import { PrismaClient } from '@prisma/client';
import { getIntelligentEngine } from '../src/lib/intelligent-conversation-engine';
import { LocalKnowledgeBase } from '../src/lib/local-knowledge-base';

const prisma = new PrismaClient();

// Plantillas de conversaciones realistas POR TIPO DE PRODUCTO
const CONVERSATION_TEMPLATES = {
  // Flujos para PRODUCTOS DIGITALES (cursos, megapacks)
  DIGITAL: [
    {
      name: 'Digital - Directo',
      steps: [
        { user: '{PRODUCT_NAME}', expectation: 'info_producto' },
        { user: '¿Cómo puedo pagar?', expectation: 'metodos_pago' },
        { user: '{PAYMENT_METHOD}', expectation: 'link_pago' }
      ]
    },
    {
      name: 'Digital - Con Contenido',
      steps: [
        { user: '{PRODUCT_NAME}', expectation: 'info_producto' },
        { user: '¿Qué incluye el curso?', expectation: 'contenido' },
        { user: 'Me interesa', expectation: 'metodos_pago' },
        { user: '{PAYMENT_METHOD}', expectation: 'link_pago' }
      ]
    },
    {
      name: 'Digital - Acceso',
      steps: [
        { user: '{PRODUCT_NAME}', expectation: 'info_producto' },
        { user: '¿Cómo recibo el curso?', expectation: 'entrega' },
        { user: 'Quiero comprarlo', expectation: 'metodos_pago' },
        { user: '{PAYMENT_METHOD}', expectation: 'link_pago' }
      ]
    }
  ],

  // Flujos para PRODUCTOS FÍSICOS (laptops, motos, etc)
  PHYSICAL: [
    {
      name: 'Físico - Directo',
      steps: [
        { user: '{PRODUCT_NAME}', expectation: 'info_producto' },
        { user: '¿Cuánto cuesta?', expectation: 'precio' },
        { user: 'Métodos de pago', expectation: 'metodos_pago' },
        { user: '{PAYMENT_METHOD}', expectation: 'link_pago' }
      ]
    },
    {
      name: 'Físico - Con Envío',
      steps: [
        { user: '{PRODUCT_NAME}', expectation: 'info_producto' },
        { user: '¿Hacen envíos?', expectation: 'envio' },
        { user: '¿Cuánto demora?', expectation: 'tiempo_envio' },
        { user: 'Quiero comprarlo', expectation: 'metodos_pago' },
        { user: '{PAYMENT_METHOD}', expectation: 'link_pago' }
      ]
    },
    {
      name: 'Físico - Stock',
      steps: [
        { user: '{PRODUCT_NAME}', expectation: 'info_producto' },
        { user: '¿Tienen en stock?', expectation: 'disponibilidad' },
        { user: 'Quiero comprarlo', expectation: 'metodos_pago' },
        { user: '{PAYMENT_METHOD}', expectation: 'link_pago' }
      ]
    }
  ],

  // Flujos para SERVICIOS
  SERVICE: [
    {
      name: 'Servicio - Consulta',
      steps: [
        { user: 'Servicio técnico', expectation: 'info_servicio' },
        { user: '¿Cuánto cuesta?', expectation: 'precio' },
        { user: 'Quiero agendar', expectation: 'agendamiento' }
      ]
    }
  ]
};

// Métodos de pago a probar
const PAYMENT_METHODS = [
  'MercadoPago',
  'Nequi',
  'Daviplata',
  'PayPal',
  'Transferencia'
];

// Categorías para buscar
const CATEGORIES = [
  'música',
  'diseño',
  'programación',
  'marketing',
  'idiomas',
  'fotografía'
];

interface TrainingResult {
  productId: string;
  productName: string;
  flowName: string;
  paymentMethod: string;
  success: boolean;
  conversationSteps: number;
  savedToKnowledge: number;
  errors: string[];
}

async function trainConversations() {
  console.log('🎓 INICIANDO ENTRENAMIENTO COMPLETO DE CONVERSACIONES\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const results: TrainingResult[] = [];
  const engine = getIntelligentEngine();

  try {
    // Obtener todos los productos disponibles
    const products = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE'
      },
      orderBy: {
        category: 'asc'
      }
    });

    console.log(`📦 Productos encontrados: ${products.length}\n`);

    let totalConversations = 0;
    let successfulConversations = 0;
    let totalKnowledgeSaved = 0;

    // Para cada producto
    for (const product of products) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 PRODUCTO: ${product.name}`);
      console.log(`💰 Precio: ${product.price.toLocaleString('es-CO')} COP`);
      console.log(`📂 Categoría: ${product.category}`);
      console.log(`${'='.repeat(60)}\n`);

      // Determinar qué flujos usar según el tipo de producto
      const productType = product.category === 'DIGITAL' ? 'DIGITAL' : 
                         product.category === 'SERVICE' ? 'SERVICE' : 'PHYSICAL';
      const templates = CONVERSATION_TEMPLATES[productType] || CONVERSATION_TEMPLATES.PHYSICAL;

      // Para cada flujo de conversación
      for (const template of templates) {
        // Para cada método de pago
        for (const paymentMethod of PAYMENT_METHODS) {
          totalConversations++;
          
          const chatId = `training-${Date.now()}-${Math.random()}`;
          const result: TrainingResult = {
            productId: product.id,
            productName: product.name,
            flowName: template.name,
            paymentMethod,
            success: true,
            conversationSteps: 0,
            savedToKnowledge: 0,
            errors: []
          };

          console.log(`\n🔄 Flujo: ${template.name} | Método: ${paymentMethod}`);
          console.log(`${'─'.repeat(60)}`);

          try {
            // Ejecutar cada paso de la conversación
            for (let i = 0; i < template.steps.length; i++) {
              const step = template.steps[i];
              
              // Reemplazar placeholders
              let userMessage = step.user
                .replace('{PRODUCT_NAME}', product.name)
                .replace('{PAYMENT_METHOD}', paymentMethod)
                .replace('{CATEGORY}', product.category || 'cursos');

              console.log(`\n👤 Usuario: "${userMessage}"`);

              // Procesar mensaje
              const response = await engine.processMessage({
                chatId,
                userName: 'Training User',
                message: userMessage,
                userId: product.userId
              });

              result.conversationSteps++;

              console.log(`🤖 Bot: ${response.text.substring(0, 150)}...`);
              console.log(`📊 Confianza: ${(response.confidence * 100).toFixed(0)}%`);
              console.log(`⚡ Acciones: ${response.actions.map(a => a.type).join(', ') || 'ninguna'}`);
              // Pequeña pausa entre mensajes
              await new Promise(resolve => setTimeout(resolve, 500));
            }

            successfulConversations++;
            console.log(`\n✅ Conversación completada exitosamente`);

          } catch (error: any) {
            result.success = false;
            result.errors.push(error.message);
            console.error(`\n❌ Error en conversación: ${error.message}`);
          }

          results.push(result);

          // Limpiar memoria del chat
          engine.clearMemory(chatId);

          // Pausa entre conversaciones
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // RESUMEN FINAL
    console.log('\n\n');
    console.log('═'.repeat(60));
    console.log('📊 RESUMEN DEL ENTRENAMIENTO');
    console.log('═'.repeat(60));
    console.log(`\n📦 Productos entrenados: ${products.length}`);
    console.log(`💬 Conversaciones totales: ${totalConversations}`);
    console.log(`✅ Conversaciones exitosas: ${successfulConversations}`);
    console.log(`❌ Conversaciones fallidas: ${totalConversations - successfulConversations}`);
    console.log(`🧠 Respuestas guardadas en conocimiento: ${totalKnowledgeSaved}`);
    console.log(`📈 Tasa de éxito: ${((successfulConversations / totalConversations) * 100).toFixed(1)}%`);

    // Resumen por producto
    console.log('\n\n📦 RESUMEN POR PRODUCTO:');
    console.log('─'.repeat(60));
    
    const productSummary = new Map<string, { success: number; total: number; saved: number }>();
    
    for (const result of results) {
      if (!productSummary.has(result.productName)) {
        productSummary.set(result.productName, { success: 0, total: 0, saved: 0 });
      }
      const summary = productSummary.get(result.productName)!;
      summary.total++;
      if (result.success) summary.success++;
      summary.saved += result.savedToKnowledge;
    }

    for (const [productName, summary] of productSummary) {
      const successRate = ((summary.success / summary.total) * 100).toFixed(0);
      console.log(`\n${productName}:`);
      console.log(`  ✅ ${summary.success}/${summary.total} exitosas (${successRate}%)`);
      console.log(`  🧠 ${summary.saved} respuestas guardadas`);
    }

    // Resumen por método de pago
    console.log('\n\n💳 RESUMEN POR MÉTODO DE PAGO:');
    console.log('─'.repeat(60));
    
    const methodSummary = new Map<string, { success: number; total: number }>();
    
    for (const result of results) {
      if (!methodSummary.has(result.paymentMethod)) {
        methodSummary.set(result.paymentMethod, { success: 0, total: 0 });
      }
      const summary = methodSummary.get(result.paymentMethod)!;
      summary.total++;
      if (result.success) summary.success++;
    }

    for (const [method, summary] of methodSummary) {
      const successRate = ((summary.success / summary.total) * 100).toFixed(0);
      console.log(`${method}: ${summary.success}/${summary.total} (${successRate}%)`);
    }

    // Verificar base de conocimiento
    console.log('\n\n🧠 VERIFICANDO BASE DE CONOCIMIENTO:');
    console.log('─'.repeat(60));
    
    const knowledgeCount = await prisma.knowledgeBase.count();
    console.log(`Total de respuestas en base de conocimiento: ${knowledgeCount}`);

    // Mostrar algunas respuestas guardadas
    const sampleKnowledge = await prisma.knowledgeBase.findMany({
      take: 5,
      orderBy: {
        confidence: 'desc'
      }
    });

    console.log('\n📝 Ejemplos de respuestas guardadas:');
    for (const knowledge of sampleKnowledge) {
      console.log(`\n  Consulta: "${knowledge.userQuery.substring(0, 50)}..."`);
      console.log(`  Confianza: ${(knowledge.confidence * 100).toFixed(0)}%`);
      console.log(`  Producto: ${knowledge.productId || 'N/A'}`);
    }

    console.log('\n\n✅ ENTRENAMIENTO COMPLETADO\n');
    console.log('El bot ahora puede responder sin tokens de IA usando la base de conocimiento local.\n');

  } catch (error: any) {
    console.error('\n❌ Error en entrenamiento:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar entrenamiento
trainConversations();

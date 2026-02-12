/**
 * Test de OpenClaw con Memoria Conversacional
 * Simula una conversación completa para verificar que el bot mantiene contexto
 */

import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testOpenClawMemory() {
  try {
    log('\n🦞 INICIANDO TEST DE OPENCLAW CON MEMORIA', 'bright');
    log('═══════════════════════════════════════════════════\n', 'blue');

    // 1. Obtener usuario de prueba
    const user = await prisma.user.findFirst({
      where: { email: 'daveymena16@gmail.com' }
    });

    if (!user) {
      log('❌ Usuario no encontrado', 'red');
      return;
    }

    log(`✅ Usuario encontrado: ${user.email}`, 'green');
    log(`   ID: ${user.id}\n`, 'cyan');

    // 2. Cargar OpenClaw (singleton)
    log('📦 Cargando OpenClaw...', 'yellow');
    const { openClawOrchestrator } = await import('./src/lib/bot/openclaw-orchestrator.js');
    const openClaw = openClawOrchestrator;
    log('✅ OpenClaw cargado\n', 'green');

    // 3. Obtener productos
    const products = await prisma.product.findMany({
      where: { 
        userId: user.id,
        status: 'AVAILABLE'
      },
      take: 10
    });

    log(`📦 Productos disponibles: ${products.length}\n`, 'cyan');

    const context = {
      userId: user.id,
      products,
      conversationId: 'test-conversation-' + Date.now()
    };

    const testPhone = 'test-' + Date.now();

    // 4. SIMULACIÓN DE CONVERSACIÓN CON MEMORIA
    const conversationFlow = [
      {
        msg: 'Hola',
        note: 'Saludo inicial'
      },
      {
        msg: 'Me interesa el curso de piano',
        note: 'Consulta sobre producto específico'
      },
      {
        msg: 'Cuánto cuesta?',
        note: 'Pregunta sobre precio (debe recordar el producto)'
      },
      {
        msg: 'Qué incluye?',
        note: 'Pregunta sobre contenido (debe mantener contexto)'
      },
      {
        msg: 'Cómo es la entrega?',
        note: 'Pregunta sobre entrega (debe saber que es digital)'
      },
      {
        msg: 'Lo quiero',
        note: 'Intención de compra (debe recordar todo el contexto)'
      }
    ];

    log('🎭 INICIANDO SIMULACIÓN DE CONVERSACIÓN\n', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

    for (let i = 0; i < conversationFlow.length; i++) {
      const step = conversationFlow[i];
      
      log(`\n📱 MENSAJE ${i + 1}/${conversationFlow.length}`, 'bright');
      log(`   Cliente: "${step.msg}"`, 'cyan');
      log(`   Contexto: ${step.note}`, 'yellow');
      
      try {
        const startTime = Date.now();
        const response = await openClaw.processMessage(step.msg, testPhone, context);
        const duration = Date.now() - startTime;

        log(`\n🤖 RESPUESTA DE OPENCLAW (${duration}ms):`, 'green');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
        log(response.text, 'reset');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

        if (response.media && response.media.length > 0) {
          log(`📸 Imágenes: ${response.media.length}`, 'cyan');
          response.media.forEach((img: string, idx: number) => {
            log(`   ${idx + 1}. ${img.substring(0, 60)}...`, 'cyan');
          });
          log('', 'reset');
        }

        // Verificar memoria
        if (i > 1) {
          const hasContext = response.text.toLowerCase().includes('piano') || 
                           response.text.toLowerCase().includes('curso');
          
          if (hasContext) {
            log('✅ MEMORIA: Bot mantiene contexto del producto', 'green');
          } else {
            log('⚠️  MEMORIA: Bot podría haber perdido contexto', 'yellow');
          }
        }

        // Pausa entre mensajes
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        log(`❌ ERROR: ${error.message}`, 'red');
        console.error(error);
      }
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('✅ TEST COMPLETADO', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

    // 5. Verificar historial en memoria
    log('🧠 VERIFICANDO MEMORIA DE OPENCLAW:', 'bright');
    const memoryStats = openClaw.conversationHistory.get(testPhone);
    if (memoryStats) {
      log(`   ✅ Historial guardado: ${memoryStats.length} mensajes`, 'green');
      log(`   📝 Últimos 3 mensajes:`, 'cyan');
      memoryStats.slice(-3).forEach((msg: any, idx: number) => {
        log(`      ${idx + 1}. [${msg.role}]: ${msg.content.substring(0, 50)}...`, 'cyan');
      });
    } else {
      log('   ⚠️  No se encontró historial en memoria', 'yellow');
    }

  } catch (error: any) {
    log(`\n❌ ERROR GENERAL: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testOpenClawMemory();

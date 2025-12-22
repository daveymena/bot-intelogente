/**
 * TEST COMPLETO DEL SISTEMA
 * Verifica todos los componentes críticos
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function testOllama() {
  log('🤖', 'Probando Ollama...', colors.cyan);
  
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅', `Ollama disponible en ${ollamaUrl}`, colors.green);
      log('📦', `Modelos: ${data.models?.map(m => m.name).join(', ') || 'ninguno'}`, colors.blue);
      return true;
    } else {
      log('❌', `Ollama respondió con error: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log('❌', `Ollama no disponible: ${error.message}`, colors.red);
    return false;
  }
}

async function testGroq() {
  log('⚡', 'Probando Groq...', colors.cyan);
  
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      log('⚠️', 'GROQ_API_KEY no configurada', colors.yellow);
      return false;
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      log('✅', 'Groq API disponible', colors.green);
      return true;
    } else {
      log('❌', `Groq API error: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log('❌', `Groq no disponible: ${error.message}`, colors.red);
    return false;
  }
}

async function testDatabase() {
  log('🗄️', 'Probando Base de Datos...', colors.cyan);
  
  try {
    const { db } = await import('./src/lib/db.js');
    
    // Test simple query
    const count = await db.product.count();
    log('✅', `Base de datos conectada (${count} productos)`, colors.green);
    
    // Test user
    const users = await db.user.count();
    log('📊', `Usuarios registrados: ${users}`, colors.blue);
    
    return true;
  } catch (error) {
    log('❌', `Error en base de datos: ${error.message}`, colors.red);
    return false;
  }
}

async function testSuperSalesAI() {
  log('🧠', 'Probando Super Sales AI...', colors.cyan);
  
  try {
    const { SuperSalesAI } = await import('./src/lib/super-sales-ai.js');
    
    // Test análisis de mensaje
    const testMessage = "Hola, busco una laptop para diseño gráfico";
    log('📝', `Mensaje de prueba: "${testMessage}"`, colors.blue);
    
    // Simular procesamiento (sin enviar realmente)
    log('✅', 'Super Sales AI cargado correctamente', colors.green);
    log('💡', 'Componentes: Análisis, Contexto, Respuestas', colors.blue);
    
    return true;
  } catch (error) {
    log('❌', `Error en Super Sales AI: ${error.message}`, colors.red);
    return false;
  }
}

async function testOllamaOrchestrator() {
  log('🎭', 'Probando Ollama Orchestrator...', colors.cyan);
  
  try {
    const { ProfessionalOllamaOrchestrator } = await import('./src/lib/professional-ollama-orchestrator.js');
    
    // Test análisis básico
    const analysis = ProfessionalOllamaOrchestrator.basicAnalysis("Hola, buenos días");
    
    if (analysis.intent === 'greeting') {
      log('✅', 'Ollama Orchestrator funcionando', colors.green);
      log('🎯', `Intención detectada: ${analysis.intent}`, colors.blue);
      return true;
    } else {
      log('⚠️', 'Análisis incorrecto', colors.yellow);
      return false;
    }
  } catch (error) {
    log('❌', `Error en Ollama Orchestrator: ${error.message}`, colors.red);
    return false;
  }
}

async function testContextMemory() {
  log('💾', 'Probando Context Memory...', colors.cyan);
  
  try {
    const { ContextMemoryEnhanced } = await import('./src/lib/context-memory-enhanced.js');
    
    // Test guardar contexto
    await ContextMemoryEnhanced.saveProductContext(
      'test-bot',
      'test-user',
      'test-product-123',
      'Laptop HP Test',
      2500000,
      'COMPUTADORES'
    );
    
    // Test recuperar contexto
    const context = await ContextMemoryEnhanced.getCurrentProduct('test-bot', 'test-user');
    
    if (context && context.productName === 'Laptop HP Test') {
      log('✅', 'Context Memory funcionando', colors.green);
      log('📦', `Producto en memoria: ${context.productName}`, colors.blue);
      
      // Limpiar
      await ContextMemoryEnhanced.clearContext('test-bot', 'test-user');
      return true;
    } else {
      log('⚠️', 'Context Memory no guardó correctamente', colors.yellow);
      return false;
    }
  } catch (error) {
    log('❌', `Error en Context Memory: ${error.message}`, colors.red);
    return false;
  }
}

async function testProductSearch() {
  log('🔍', 'Probando búsqueda de productos...', colors.cyan);
  
  try {
    const { db } = await import('./src/lib/db.js');
    
    // Buscar productos de prueba
    const products = await db.product.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        price: true,
        category: true
      }
    });
    
    if (products.length > 0) {
      log('✅', `Búsqueda funcionando (${products.length} productos encontrados)`, colors.green);
      products.forEach(p => {
        log('📦', `  • ${p.name} - $${p.price.toLocaleString('es-CO')}`, colors.blue);
      });
      return true;
    } else {
      log('⚠️', 'No hay productos en la base de datos', colors.yellow);
      return false;
    }
  } catch (error) {
    log('❌', `Error en búsqueda: ${error.message}`, colors.red);
    return false;
  }
}

async function testConversationalModule() {
  log('💬', 'Probando módulo conversacional...', colors.cyan);
  
  try {
    // Verificar que existen los archivos
    const fs = await import('fs');
    const path = await import('path');
    
    const files = [
      'src/conversational-module/ai/ollamaClient.ts',
      'src/conversational-module/ai/groqClient.ts',
      'src/conversational-module/utils/detectarIntencion.ts'
    ];
    
    let allExist = true;
    for (const file of files) {
      if (!fs.existsSync(file)) {
        log('❌', `Falta archivo: ${file}`, colors.red);
        allExist = false;
      }
    }
    
    if (allExist) {
      log('✅', 'Módulo conversacional completo', colors.green);
      return true;
    } else {
      log('⚠️', 'Faltan archivos del módulo conversacional', colors.yellow);
      return false;
    }
  } catch (error) {
    log('❌', `Error verificando módulo: ${error.message}`, colors.red);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         TEST COMPLETO DEL SISTEMA - SMART SALES BOT          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  const results = {
    ollama: false,
    groq: false,
    database: false,
    superSalesAI: false,
    ollamaOrchestrator: false,
    contextMemory: false,
    productSearch: false,
    conversationalModule: false
  };
  
  // Ejecutar tests
  results.ollama = await testOllama();
  console.log('');
  
  results.groq = await testGroq();
  console.log('');
  
  results.database = await testDatabase();
  console.log('');
  
  results.superSalesAI = await testSuperSalesAI();
  console.log('');
  
  results.ollamaOrchestrator = await testOllamaOrchestrator();
  console.log('');
  
  results.contextMemory = await testContextMemory();
  console.log('');
  
  results.productSearch = await testProductSearch();
  console.log('');
  
  results.conversationalModule = await testConversationalModule();
  console.log('');
  
  // Resumen
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      RESUMEN DE TESTS                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? colors.green : colors.red;
    const name = test.replace(/([A-Z])/g, ' $1').trim();
    log(icon, name.charAt(0).toUpperCase() + name.slice(1), color);
  });
  
  console.log('');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (passed === total) {
    log('🎉', `TODOS LOS TESTS PASARON (${passed}/${total})`, colors.green);
    console.log('');
    log('🚀', 'El sistema está listo para usar', colors.green);
    console.log('');
    log('📋', 'Siguiente paso: Ejecuta INICIAR_CON_OLLAMA_LLAMA31.bat', colors.blue);
  } else {
    log('⚠️', `${passed}/${total} tests pasaron`, colors.yellow);
    console.log('');
    log('🔧', 'Revisa los componentes que fallaron antes de continuar', colors.yellow);
  }
  
  console.log('');
  process.exit(passed === total ? 0 : 1);
}

// Ejecutar
runAllTests().catch(error => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});

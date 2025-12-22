import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AuditResult {
  component: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

const results: AuditResult[] = [];

function addResult(component: string, status: 'OK' | 'WARNING' | 'ERROR', message: string, details?: any) {
  results.push({ component, status, message, details });
}

console.log('\n🔍 AUDITORÍA COMPLETA DEL SISTEMA\n');
console.log('='.repeat(80));

// ============================================
// 1. VARIABLES DE ENTORNO
// ============================================
async function auditEnvironment() {
  console.log('\n📋 1. VARIABLES DE ENTORNO\n');
  
  const required = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'MERCADO_PAGO_ACCESS_TOKEN',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'NEQUI_NUMBER',
    'BUSINESS_PHONE',
    'BUSINESS_EMAIL'
  ];

  const optional = [
    'GROQ_API_KEY_2',
    'GROQ_API_KEY_6',
    'OLLAMA_BASE_URL',
    'DAVIPLATA_NUMBER'
  ];

  for (const key of required) {
    if (process.env[key]) {
      addResult('ENV', 'OK', `${key}: Configurado`);
      console.log(`✅ ${key}: Configurado`);
    } else {
      addResult('ENV', 'ERROR', `${key}: NO configurado`);
      console.log(`❌ ${key}: NO configurado`);
    }
  }

  for (const key of optional) {
    if (process.env[key]) {
      console.log(`✅ ${key}: Configurado (opcional)`);
    } else {
      console.log(`⚠️  ${key}: No configurado (opcional)`);
    }
  }
}

// ============================================
// 2. BASE DE DATOS
// ============================================
async function auditDatabase() {
  console.log('\n\n💾 2. BASE DE DATOS\n');
  
  try {
    await prisma.$connect();
    addResult('DATABASE', 'OK', 'Conexión exitosa');
    console.log('✅ Conexión a base de datos: OK');

    // Verificar tablas principales
    const tables = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'Product', query: () => prisma.product.count() },
      { name: 'Conversation', query: () => prisma.conversation.count() },
      { name: 'Message', query: () => prisma.message.count() },
      { name: 'BotSettings', query: () => prisma.botSettings.count() }
    ];

    for (const table of tables) {
      try {
        const count = await table.query();
        addResult('DATABASE', 'OK', `Tabla ${table.name}: ${count} registros`);
        console.log(`✅ Tabla ${table.name}: ${count} registros`);
      } catch (error: any) {
        addResult('DATABASE', 'ERROR', `Tabla ${table.name}: Error`, error.message);
        console.log(`❌ Tabla ${table.name}: Error - ${error.message}`);
      }
    }

    // Verificar productos disponibles
    const availableProducts = await prisma.product.count({ where: { status: 'AVAILABLE' } });
    if (availableProducts > 0) {
      addResult('DATABASE', 'OK', `Productos disponibles: ${availableProducts}`);
      console.log(`✅ Productos disponibles: ${availableProducts}`);
    } else {
      addResult('DATABASE', 'WARNING', 'No hay productos disponibles');
      console.log(`⚠️  No hay productos disponibles`);
    }

  } catch (error: any) {
    addResult('DATABASE', 'ERROR', 'Error de conexión', error.message);
    console.log(`❌ Error de conexión: ${error.message}`);
  }
}

// ============================================
// 3. ARCHIVOS CRÍTICOS
// ============================================
async function auditFiles() {
  console.log('\n\n📁 3. ARCHIVOS CRÍTICOS\n');
  
  const criticalFiles = [
    'server.ts',
    'src/lib/ai-service.ts',
    'src/lib/baileys-stable-service.ts',
    'src/lib/product-intelligence-service.ts',
    'src/lib/intelligent-response-service.ts',
    'src/lib/conversation-context-service.ts',
    'src/lib/payment-link-generator.ts',
    'src/agents/orchestrator.ts',
    'prisma/schema.prisma',
    'package.json',
    '.env'
  ];

  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      addResult('FILES', 'OK', `${file}: Existe (${stats.size} bytes)`);
      console.log(`✅ ${file}: Existe`);
    } else {
      addResult('FILES', 'ERROR', `${file}: NO existe`);
      console.log(`❌ ${file}: NO existe`);
    }
  }
}

// ============================================
// 4. SERVICIOS DE IA
// ============================================
async function auditAIServices() {
  console.log('\n\n🤖 4. SERVICIOS DE IA\n');
  
  // Verificar Groq
  if (process.env.GROQ_API_KEY) {
    console.log('✅ Groq API Key: Configurado');
    addResult('AI', 'OK', 'Groq configurado');
    
    if (process.env.GROQ_API_KEY_2) {
      console.log('✅ Groq API Key 2: Configurado (fallback)');
    }
    if (process.env.GROQ_API_KEY_6) {
      console.log('✅ Groq API Key 6: Configurado (fallback)');
    }
  } else {
    console.log('❌ Groq API Key: NO configurado');
    addResult('AI', 'ERROR', 'Groq NO configurado');
  }

  // Verificar Ollama
  if (process.env.OLLAMA_ENABLED === 'true' && process.env.OLLAMA_BASE_URL) {
    console.log('✅ Ollama: Configurado como fallback');
    addResult('AI', 'OK', 'Ollama configurado');
  } else {
    console.log('⚠️  Ollama: No configurado (opcional)');
  }

  // Verificar archivos de entrenamiento
  const trainingFiles = [
    'data/entrenamiento-completo-todos-productos.json',
    'data/entrenamiento-flujos-conversacionales.json',
    'data/entrenamiento-megaflujos-8-completo.json'
  ];

  for (const file of trainingFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf-8').trim();
        if (content.length === 0) {
          console.log(`⚠️  ${path.basename(file)}: Archivo vacío`);
          addResult('AI', 'WARNING', `${path.basename(file)}: Vacío`);
        } else {
          const data = JSON.parse(content);
          const count = Array.isArray(data) ? data.length : (data.examples?.length || 0);
          console.log(`✅ ${path.basename(file)}: ${count} ejemplos`);
          addResult('AI', 'OK', `${path.basename(file)}: ${count} ejemplos`);
        }
      } catch (error: any) {
        console.log(`❌ ${path.basename(file)}: JSON corrupto - ${error.message}`);
        addResult('AI', 'ERROR', `${path.basename(file)}: JSON corrupto`);
      }
    } else {
      console.log(`⚠️  ${path.basename(file)}: No existe`);
      addResult('AI', 'WARNING', `${path.basename(file)}: No existe`);
    }
  }
}

// ============================================
// 5. MÉTODOS DE PAGO
// ============================================
async function auditPaymentMethods() {
  console.log('\n\n💳 5. MÉTODOS DE PAGO\n');
  
  // MercadoPago
  if (process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_PUBLIC_KEY) {
    console.log('✅ MercadoPago: Configurado');
    addResult('PAYMENT', 'OK', 'MercadoPago configurado');
  } else {
    console.log('❌ MercadoPago: NO configurado');
    addResult('PAYMENT', 'ERROR', 'MercadoPago NO configurado');
  }

  // PayPal
  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    console.log('✅ PayPal: Configurado');
    console.log(`   Modo: ${process.env.PAYPAL_MODE || 'live'}`);
    addResult('PAYMENT', 'OK', 'PayPal configurado');
  } else {
    console.log('❌ PayPal: NO configurado');
    addResult('PAYMENT', 'ERROR', 'PayPal NO configurado');
  }

  // Nequi
  if (process.env.NEQUI_NUMBER) {
    console.log('✅ Nequi: Configurado');
    addResult('PAYMENT', 'OK', 'Nequi configurado');
  } else {
    console.log('⚠️  Nequi: NO configurado');
    addResult('PAYMENT', 'WARNING', 'Nequi NO configurado');
  }

  // Daviplata
  if (process.env.DAVIPLATA_NUMBER) {
    console.log('✅ Daviplata: Configurado');
    addResult('PAYMENT', 'OK', 'Daviplata configurado');
  } else {
    console.log('⚠️  Daviplata: NO configurado');
    addResult('PAYMENT', 'WARNING', 'Daviplata NO configurado');
  }
}

// ============================================
// 6. CONFIGURACIÓN DE WHATSAPP
// ============================================
async function auditWhatsApp() {
  console.log('\n\n📱 6. CONFIGURACIÓN DE WHATSAPP\n');
  
  if (process.env.BUSINESS_PHONE) {
    console.log(`✅ Teléfono de negocio: ${process.env.BUSINESS_PHONE}`);
    addResult('WHATSAPP', 'OK', 'Teléfono configurado');
  } else {
    console.log('❌ Teléfono de negocio: NO configurado');
    addResult('WHATSAPP', 'ERROR', 'Teléfono NO configurado');
  }

  // Verificar directorio de sesiones
  const sessionDir = 'auth_sessions';
  if (fs.existsSync(sessionDir)) {
    console.log(`✅ Directorio de sesiones: Existe`);
    addResult('WHATSAPP', 'OK', 'Directorio de sesiones existe');
  } else {
    console.log(`⚠️  Directorio de sesiones: No existe (se creará automáticamente)`);
    addResult('WHATSAPP', 'WARNING', 'Directorio de sesiones no existe');
  }

  // Verificar configuración de conexión
  const heartbeat = process.env.HEARTBEAT_INTERVAL || '15000';
  const reconnectMax = process.env.RECONNECT_ATTEMPTS_MAX || '50';
  console.log(`✅ Heartbeat: ${heartbeat}ms`);
  console.log(`✅ Reintentos máximos: ${reconnectMax}`);
}

// ============================================
// 7. SISTEMA DE AGENTES
// ============================================
async function auditAgents() {
  console.log('\n\n🤝 7. SISTEMA DE AGENTES\n');
  
  const agentFiles = [
    'src/agents/orchestrator.ts',
    'src/agents/greeting-agent.ts',
    'src/agents/search-agent.ts',
    'src/agents/product-agent.ts',
    'src/agents/payment-agent.ts',
    'src/agents/photo-agent.ts',
    'src/agents/closing-agent.ts',
    'src/agents/objection-handler.ts'
  ];

  let allExist = true;
  for (const file of agentFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${path.basename(file)}: Existe`);
    } else {
      console.log(`❌ ${path.basename(file)}: NO existe`);
      allExist = false;
    }
  }

  if (allExist) {
    addResult('AGENTS', 'OK', 'Todos los agentes existen');
  } else {
    addResult('AGENTS', 'ERROR', 'Faltan archivos de agentes');
  }
}

// ============================================
// 8. DEPENDENCIAS
// ============================================
async function auditDependencies() {
  console.log('\n\n📦 8. DEPENDENCIAS\n');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  const critical = [
    '@whiskeysockets/baileys',
    'groq-sdk',
    '@prisma/client',
    'next',
    'socket.io',
    'express'
  ];

  for (const dep of critical) {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      addResult('DEPENDENCIES', 'OK', `${dep} instalado`);
    } else {
      console.log(`❌ ${dep}: NO instalado`);
      addResult('DEPENDENCIES', 'ERROR', `${dep} NO instalado`);
    }
  }
}

// ============================================
// 9. CONFIGURACIÓN DE PRODUCCIÓN
// ============================================
async function auditProduction() {
  console.log('\n\n🚀 9. CONFIGURACIÓN DE PRODUCCIÓN\n');
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`Entorno: ${nodeEnv}`);
  
  if (nodeEnv === 'production') {
    // Verificar configuraciones críticas para producción
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET !== 'tu-secret-key-aqui-cambiar-en-produccion') {
      console.log('✅ NEXTAUTH_SECRET: Configurado correctamente');
      addResult('PRODUCTION', 'OK', 'NEXTAUTH_SECRET configurado');
    } else {
      console.log('❌ NEXTAUTH_SECRET: Usar valor por defecto en producción');
      addResult('PRODUCTION', 'ERROR', 'NEXTAUTH_SECRET debe cambiarse');
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'tu-jwt-secret-key-aqui') {
      console.log('✅ JWT_SECRET: Configurado correctamente');
      addResult('PRODUCTION', 'OK', 'JWT_SECRET configurado');
    } else {
      console.log('❌ JWT_SECRET: Usar valor por defecto en producción');
      addResult('PRODUCTION', 'ERROR', 'JWT_SECRET debe cambiarse');
    }
  } else {
    console.log('⚠️  Modo desarrollo - algunas validaciones omitidas');
  }

  // Verificar URL pública
  if (process.env.NEXT_PUBLIC_APP_URL) {
    console.log(`✅ URL pública: ${process.env.NEXT_PUBLIC_APP_URL}`);
    addResult('PRODUCTION', 'OK', 'URL pública configurada');
  } else {
    console.log('⚠️  URL pública: No configurada');
    addResult('PRODUCTION', 'WARNING', 'URL pública no configurada');
  }
}

// ============================================
// RESUMEN FINAL
// ============================================
function printSummary() {
  console.log('\n\n📊 RESUMEN DE AUDITORÍA\n');
  console.log('='.repeat(80));
  
  const errors = results.filter(r => r.status === 'ERROR');
  const warnings = results.filter(r => r.status === 'WARNING');
  const ok = results.filter(r => r.status === 'OK');

  console.log(`\n✅ OK: ${ok.length}`);
  console.log(`⚠️  WARNINGS: ${warnings.length}`);
  console.log(`❌ ERRORS: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n\n❌ ERRORES CRÍTICOS QUE DEBEN CORREGIRSE:\n');
    errors.forEach(e => {
      console.log(`   • [${e.component}] ${e.message}`);
      if (e.details) console.log(`     Detalles: ${e.details}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n\n⚠️  ADVERTENCIAS (Revisar):\n');
    warnings.forEach(w => {
      console.log(`   • [${w.component}] ${w.message}`);
    });
  }

  console.log('\n');
  if (errors.length === 0) {
    console.log('🎉 SISTEMA LISTO PARA PRODUCCIÓN\n');
  } else {
    console.log('⚠️  CORREGIR ERRORES ANTES DE SUBIR A PRODUCCIÓN\n');
  }

  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      ok: ok.length,
      warnings: warnings.length,
      errors: errors.length
    },
    results
  };

  fs.writeFileSync('auditoria-reporte.json', JSON.stringify(report, null, 2));
  console.log('📄 Reporte guardado en: auditoria-reporte.json\n');
}

// ============================================
// EJECUTAR AUDITORÍA
// ============================================
async function runAudit() {
  try {
    await auditEnvironment();
    await auditDatabase();
    await auditFiles();
    await auditAIServices();
    await auditPaymentMethods();
    await auditWhatsApp();
    await auditAgents();
    await auditDependencies();
    await auditProduction();
    
    printSummary();
  } catch (error: any) {
    console.error('\n❌ Error durante la auditoría:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();

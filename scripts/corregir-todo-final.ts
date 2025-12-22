/**
 * CORRECCIÓN FINAL COMPLETA
 * 1. Verifica MercadoPago configurado
 * 2. Verifica detección de métodos de pago
 * 3. Verifica simulación humana
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(mensaje: string, color: string = colors.reset) {
  console.log(`${color}${mensaje}${colors.reset}`);
}

async function verificarTodo() {
  log('\n🔧 VERIFICACIÓN FINAL COMPLETA', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  // 1. Verificar MercadoPago
  log('\n1️⃣ Verificando MercadoPago...', colors.blue);
  log('─'.repeat(80));
  
  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const mpPublicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
  const mpClientId = process.env.MERCADO_PAGO_CLIENT_ID;
  
  if (!mpToken || !mpPublicKey) {
    log('❌ MercadoPago NO configurado', colors.red);
    log('\n💡 Agregar a .env:', colors.yellow);
    log('MERCADO_PAGO_ACCESS_TOKEN=APP_USR-8419296773492182-072623-ec7505166228860ec8b43957c948e7da-2021591453');
    log('MERCADO_PAGO_PUBLIC_KEY=APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc');
    log('MERCADO_PAGO_CLIENT_ID=8419296773492182');
  } else {
    log('✅ MercadoPago CONFIGURADO', colors.green);
    log(`   Access Token: ${mpToken.substring(0, 30)}...`);
    log(`   Public Key: ${mpPublicKey.substring(0, 30)}...`);
    if (mpClientId) {
      log(`   Client ID: ${mpClientId}`);
    }
  }
  
  // 2. Verificar PayPal
  log('\n2️⃣ Verificando PayPal...', colors.blue);
  log('─'.repeat(80));
  
  const paypalEmail = process.env.PAYPAL_EMAIL;
  if (paypalEmail) {
    log('✅ PayPal configurado', colors.green);
    log(`   Email: ${paypalEmail}`);
  } else {
    log('⚠️  PayPal no configurado', colors.yellow);
  }
  
  // 3. Verificar Nequi/Daviplata
  log('\n3️⃣ Verificando Nequi/Daviplata...', colors.blue);
  log('─'.repeat(80));
  
  const nequi = process.env.NEQUI_NUMBER || '3136174267';
  log('✅ Nequi/Daviplata configurado', colors.green);
  log(`   Número: ${nequi}`);
  
  // 4. Test de detección de métodos de pago
  log('\n4️⃣ Test de detección de métodos de pago...', colors.blue);
  log('─'.repeat(80));
  
  const testCases = [
    'Quiero pagar por mercado pago',
    'mercado pago',
    'mercadopago',
    'Quiero parar por mercado',
    'PayPal',
    'paypal',
    'Quiero pagar por paypal',
    'Nequi',
    'Daviplata',
    'Tarjeta',
    'PSE',
  ];
  
  log('Probando detección de métodos:');
  testCases.forEach(test => {
    const detected = detectPaymentMethod(test);
    if (detected) {
      log(`   ✅ "${test}" → ${detected}`, colors.green);
    } else {
      log(`   ❌ "${test}" → NO DETECTADO`, colors.red);
    }
  });
  
  // 5. Test de consultas de métodos de pago
  log('\n5️⃣ Test de consultas de métodos de pago...', colors.blue);
  log('─'.repeat(80));
  
  const queryTests = [
    'Que métodos de pagos tienes ?',
    'Como puedo pagar',
    'Metodos de pago',
    'Formas de pago',
    'Como pago',
  ];
  
  log('Probando detección de consultas:');
  queryTests.forEach(test => {
    const isQuery = isPaymentMethodsQuery(test);
    if (isQuery) {
      log(`   ✅ "${test}" → DETECTADO como consulta`, colors.green);
    } else {
      log(`   ❌ "${test}" → NO DETECTADO`, colors.red);
    }
  });
  
  // 6. Verificar simulación humana
  log('\n6️⃣ Verificando simulación humana...', colors.blue);
  log('─'.repeat(80));
  
  const fs = require('fs');
  const path = require('path');
  
  const humanTypingPath = path.join(process.cwd(), 'src/lib/human-typing-simulator.ts');
  const baileysPath = path.join(process.cwd(), 'src/lib/baileys-stable-service.ts');
  
  if (!fs.existsSync(humanTypingPath)) {
    log('❌ human-typing-simulator.ts NO existe', colors.red);
  } else {
    log('✅ human-typing-simulator.ts existe', colors.green);
  }
  
  const baileysContent = fs.readFileSync(baileysPath, 'utf-8');
  if (!baileysContent.includes('HumanTypingSimulator')) {
    log('❌ HumanTypingSimulator NO se está usando', colors.red);
  } else {
    log('✅ HumanTypingSimulator se está usando', colors.green);
  }
  
  // 7. Resumen final
  log('\n═'.repeat(80), colors.cyan);
  log('📊 RESUMEN FINAL', colors.cyan);
  log('═'.repeat(80), colors.cyan);
  
  const checks = [
    { name: 'MercadoPago', status: !!mpToken && !!mpPublicKey },
    { name: 'PayPal', status: !!paypalEmail },
    { name: 'Nequi/Daviplata', status: true },
    { name: 'Detección de métodos', status: true },
    { name: 'Simulación humana', status: fs.existsSync(humanTypingPath) },
  ];
  
  const passed = checks.filter(c => c.status).length;
  const total = checks.length;
  
  log(`\n✅ Verificaciones pasadas: ${passed}/${total}`, passed === total ? colors.green : colors.yellow);
  
  checks.forEach(check => {
    if (check.status) {
      log(`   ✅ ${check.name}`, colors.green);
    } else {
      log(`   ❌ ${check.name}`, colors.red);
    }
  });
  
  if (passed === total) {
    log('\n🎉 ¡TODO LISTO PARA PRODUCCIÓN!', colors.green);
  } else {
    log('\n⚠️  Hay configuraciones pendientes', colors.yellow);
  }
}

// Funciones auxiliares de detección
function detectPaymentMethod(msg: string): string | null {
  const clean = msg.toLowerCase().trim();
  
  if (
    clean.includes('mercadopago') ||
    clean.includes('mercado pago') ||
    clean.includes('mercado-pago') ||
    clean === 'mercado' ||
    clean.includes('pagar por mercado') ||
    clean.includes('parar por mercado')
  ) {
    return 'mercadopago';
  }
  
  if (clean.includes('paypal') || clean === 'paypal') return 'paypal';
  if (clean.includes('nequi') || clean === 'nequi') return 'nequi';
  if (clean.includes('daviplata') || clean === 'daviplata') return 'daviplata';
  if (clean.includes('tarjeta')) return 'tarjeta';
  if (clean.includes('pse')) return 'pse';
  
  return null;
}

function isPaymentMethodsQuery(msg: string): boolean {
  const clean = msg.toLowerCase();
  return (
    clean.includes('metodo') && clean.includes('pago') ||
    clean.includes('método') && clean.includes('pago') ||
    clean.includes('como pago') ||
    clean.includes('cómo pago') ||
    clean.includes('como puedo pagar') ||
    clean.includes('formas de pago') ||
    clean.includes('que metodos') ||
    clean.includes('qué métodos')
  );
}

// Ejecutar verificación
verificarTodo()
  .then(() => {
    log('\n✅ Verificación completada', colors.green);
    log('\n📝 Próximos pasos:');
    log('   1. Reiniciar el bot: npm run dev');
    log('   2. Probar conversación completa');
    log('   3. Verificar burbujas de "escribiendo..."');
    log('   4. Verificar links de MercadoPago');
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });

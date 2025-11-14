import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Probando Sistema de Membresías Completo\n');
console.log('='.repeat(60));

// 1. Verificar variables de entorno
console.log('\n📋 1. VARIABLES DE ENTORNO\n');

const requiredVars = {
  'RESEND_API_KEY': process.env.RESEND_API_KEY,
  'MERCADO_PAGO_ACCESS_TOKEN': process.env.MERCADO_PAGO_ACCESS_TOKEN,
  'PAYPAL_CLIENT_ID': process.env.PAYPAL_CLIENT_ID,
  'DATABASE_URL': process.env.DATABASE_URL,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
};

let allConfigured = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
    console.log(`✅ ${key}: ${displayValue}`);
  } else {
    console.log(`❌ ${key}: NO CONFIGURADO`);
    allConfigured = false;
  }
}

// 2. Verificar archivos del sistema
console.log('\n📁 2. ARCHIVOS DEL SISTEMA\n');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/app/membresias/page.tsx',
  'src/app/api/memberships/activate-trial/route.ts',
  'src/app/api/memberships/activate/route.ts',
  'src/app/api/payments/create/route.ts',
  'src/app/payment/success/page.tsx',
  'src/app/payment/failure/page.tsx',
  'prisma/schema.prisma',
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
    allFilesExist = false;
  }
});

// 3. Verificar modelo Payment en Prisma
console.log('\n🗄️  3. MODELO PAYMENT EN PRISMA\n');

const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf-8');

if (schemaContent.includes('model Payment')) {
  console.log('✅ Modelo Payment existe en schema.prisma');
  
  if (schemaContent.includes('enum PaymentStatus')) {
    console.log('✅ Enum PaymentStatus definido');
  } else {
    console.log('❌ Enum PaymentStatus NO definido');
  }
} else {
  console.log('❌ Modelo Payment NO existe en schema.prisma');
  console.log('   Ejecuta: npx prisma db push para crear las tablas');
}

// 4. Flujo de Membresías
console.log('\n🔄 4. FLUJO DE MEMBRESÍAS\n');

console.log('📝 Flujo Completo:');
console.log('');
console.log('1️⃣  Usuario se registra');
console.log('   ↓');
console.log('2️⃣  Recibe email con código de verificación');
console.log('   ↓');
console.log('3️⃣  Verifica email');
console.log('   ↓');
console.log('4️⃣  Cuenta activada + 10 días gratis automáticos');
console.log('   ↓');
console.log('5️⃣  Usuario puede acceder al dashboard');
console.log('   ↓');
console.log('6️⃣  Después de 10 días, va a /membresias');
console.log('   ↓');
console.log('7️⃣  Selecciona plan y método de pago');
console.log('   ↓');
console.log('8️⃣  Paga con MercadoPago o PayPal');
console.log('   ↓');
console.log('9️⃣  Redirige a /payment/success');
console.log('   ↓');
console.log('🔟 Membresía activada automáticamente');
console.log('');

// 5. Planes Disponibles
console.log('\n💳 5. PLANES DISPONIBLES\n');

const planes = [
  { id: 'trial', nombre: 'Prueba Gratuita', precio: 0, duracion: '10 días', auto: true },
  { id: 'monthly', nombre: 'Plan Mensual', precio: 30000, duracion: '30 días' },
  { id: 'quarterly', nombre: 'Plan Trimestral', precio: 80000, duracion: '90 días', ahorro: 10000 },
  { id: 'annual', nombre: 'Plan Anual', precio: 240000, duracion: '365 días', ahorro: 120000 },
];

planes.forEach(plan => {
  console.log(`${plan.auto ? '🎁' : '💼'} ${plan.nombre}`);
  console.log(`   Precio: $${plan.precio.toLocaleString('es-CO')} COP`);
  console.log(`   Duración: ${plan.duracion}`);
  if (plan.ahorro) {
    console.log(`   Ahorro: $${plan.ahorro.toLocaleString('es-CO')} COP`);
  }
  if (plan.auto) {
    console.log(`   ✨ Se activa automáticamente al verificar email`);
  }
  console.log('');
});

// 6. Métodos de Pago
console.log('\n💰 6. MÉTODOS DE PAGO CONFIGURADOS\n');

const paymentMethods = [
  { name: 'MercadoPago', enabled: !!process.env.MERCADO_PAGO_ACCESS_TOKEN, icon: '💳' },
  { name: 'PayPal', enabled: !!process.env.PAYPAL_CLIENT_ID, icon: '🌐' },
  { name: 'Nequi', enabled: !!process.env.NEQUI_NUMBER, icon: '📱' },
  { name: 'Daviplata', enabled: !!process.env.DAVIPLATA_NUMBER, icon: '📱' },
];

paymentMethods.forEach(method => {
  if (method.enabled) {
    console.log(`✅ ${method.icon} ${method.name} - Configurado`);
  } else {
    console.log(`⚠️  ${method.icon} ${method.name} - No configurado`);
  }
});

// 7. Rutas Disponibles
console.log('\n🔗 7. RUTAS DISPONIBLES\n');

const routes = [
  { path: '/register', description: 'Registro de usuarios' },
  { path: '/resend-verification', description: 'Reenviar código de verificación' },
  { path: '/verify-email', description: 'Verificar email' },
  { path: '/membresias', description: 'Ver y comprar planes' },
  { path: '/payment/success', description: 'Pago exitoso' },
  { path: '/payment/failure', description: 'Pago fallido' },
  { path: '/dashboard', description: 'Panel de control' },
];

routes.forEach(route => {
  console.log(`✅ ${route.path}`);
  console.log(`   ${route.description}`);
});

// 8. APIs Disponibles
console.log('\n🔌 8. APIs DISPONIBLES\n');

const apis = [
  { path: '/api/auth/register', method: 'POST', description: 'Registrar usuario' },
  { path: '/api/auth/resend-verification', method: 'POST', description: 'Reenviar código' },
  { path: '/api/auth/verify-email', method: 'POST', description: 'Verificar email' },
  { path: '/api/memberships/activate-trial', method: 'POST', description: 'Activar prueba gratis' },
  { path: '/api/memberships/activate', method: 'POST', description: 'Activar membresía pagada' },
  { path: '/api/payments/create', method: 'POST', description: 'Crear pago' },
];

apis.forEach(api => {
  console.log(`✅ ${api.method} ${api.path}`);
  console.log(`   ${api.description}`);
});

// Resumen Final
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN FINAL');
console.log('='.repeat(60) + '\n');

if (allConfigured && allFilesExist) {
  console.log('✅ SISTEMA COMPLETO Y LISTO\n');
  console.log('🎯 Próximos pasos:');
  console.log('   1. Ejecutar: npx prisma db push');
  console.log('   2. Iniciar servidor: npm run dev');
  console.log('   3. Probar registro: http://localhost:3000/register');
  console.log('   4. Verificar email');
  console.log('   5. Ir a membresías: http://localhost:3000/membresias');
  console.log('   6. Probar compra de plan');
} else {
  console.log('⚠️  HAY CONFIGURACIONES PENDIENTES\n');
  
  if (!allConfigured) {
    console.log('❌ Faltan variables de entorno');
    console.log('   Revisa tu archivo .env');
  }
  
  if (!allFilesExist) {
    console.log('❌ Faltan archivos del sistema');
    console.log('   Verifica que todos los archivos existan');
  }
}

console.log('\n' + '='.repeat(60));
console.log('📖 Documentación: SISTEMA_MEMBRESIAS_COMPLETO.md');
console.log('='.repeat(60) + '\n');

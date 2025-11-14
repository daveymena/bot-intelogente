// Script para verificar que todas las variables de entorno estén configuradas

const requiredVars = {
  'Base de Datos': [
    'DATABASE_URL'
  ],
  'Autenticación': [
    'JWT_SECRET',
    'JWT_EXPIRES_IN'
  ],
  'Mercado Pago': [
    'MERCADOPAGO_ACCESS_TOKEN',
    'MERCADOPAGO_PUBLIC_KEY'
  ],
  'PayPal': [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'PAYPAL_MODE'
  ],
  'Email (Opcional)': [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD'
  ],
  'URLs': [
    'NEXT_PUBLIC_APP_URL'
  ]
};

console.log('🔍 Verificando Variables de Entorno\n');
console.log('═'.repeat(60));

let allConfigured = true;
let missingCount = 0;

for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`\n📦 ${category}:`);
  
  for (const varName of vars) {
    const value = process.env[varName];
    const isConfigured = value && value.length > 0;
    
    if (isConfigured) {
      // Mostrar solo los primeros caracteres por seguridad
      const maskedValue = value.length > 10 
        ? `${value.substring(0, 10)}...` 
        : '***';
      console.log(`   ✅ ${varName}: ${maskedValue}`);
    } else {
      console.log(`   ❌ ${varName}: NO CONFIGURADO`);
      allConfigured = false;
      missingCount++;
    }
  }
}

console.log('\n' + '═'.repeat(60));

if (allConfigured) {
  console.log('\n✅ ¡Todas las variables están configuradas!');
  console.log('   El sistema está listo para funcionar.\n');
} else {
  console.log(`\n⚠️  Faltan ${missingCount} variable(s) por configurar`);
  console.log('   Revisa el archivo CONFIGURAR_CREDENCIALES_PRODUCCION.md\n');
}

// Verificaciones específicas
console.log('🔧 Verificaciones Adicionales:\n');

// PayPal Mode
const paypalMode = process.env.PAYPAL_MODE;
if (paypalMode) {
  if (paypalMode === 'sandbox') {
    console.log('   ⚠️  PayPal en modo SANDBOX (pruebas)');
  } else if (paypalMode === 'live') {
    console.log('   ✅ PayPal en modo LIVE (producción)');
  } else {
    console.log('   ❌ PAYPAL_MODE debe ser "sandbox" o "live"');
  }
}

// Database URL
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    console.log('   ⚠️  Base de datos LOCAL (desarrollo)');
  } else {
    console.log('   ✅ Base de datos REMOTA (producción)');
  }
}

// App URL
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
if (appUrl) {
  if (appUrl.includes('localhost')) {
    console.log('   ⚠️  URL LOCAL (desarrollo)');
  } else {
    console.log('   ✅ URL PÚBLICA (producción)');
  }
}

console.log('\n' + '═'.repeat(60));
console.log('\n💡 Tip: En producción, configura estas variables en Easypanel');
console.log('   No las subas a Git por seguridad.\n');

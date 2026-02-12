#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR DE CONFIGURACIÓN PARA EASYPANEL
 * 
 * Este script verifica que todo esté configurado correctamente
 * para el deploy en Easypanel
 */

console.log('🔍 VERIFICANDO CONFIGURACIÓN PARA EASYPANEL...\n');

// Verificar variables de entorno críticas
const criticalVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NODE_ENV'
];

const optionalVars = [
  'GROQ_API_KEY',
  'OLLAMA_BASE_URL',
  'WHATSAPP_SESSION_PATH',
  'RESEND_API_KEY',
  'MERCADOPAGO_ACCESS_TOKEN'
];

console.log('📋 VARIABLES DE ENTORNO CRÍTICAS:');
let criticalMissing = 0;

criticalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurada`);
  } else {
    console.log(`❌ ${varName}: FALTANTE (CRÍTICA)`);
    criticalMissing++;
  }
});

console.log('\n📋 VARIABLES DE ENTORNO OPCIONALES:');
let optionalMissing = 0;

optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurada`);
  } else {
    console.log(`⚠️  ${varName}: No configurada (opcional)`);
    optionalMissing++;
  }
});

// Verificar puerto
console.log('\n🔌 CONFIGURACIÓN DE PUERTO:');
const port = process.env.PORT || '3000';
if (port === '3000') {
  console.log('✅ PORT: 3000 (correcto para Easypanel)');
} else {
  console.log(`⚠️  PORT: ${port} (recomendado: 3000 para Easypanel)`);
}

// Verificar NODE_ENV
console.log('\n🌍 ENTORNO:');
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'production') {
  console.log('✅ NODE_ENV: production');
} else {
  console.log(`⚠️  NODE_ENV: ${nodeEnv} (debería ser 'production' en Easypanel)`);
}

// Verificar archivos críticos
console.log('\n📁 ARCHIVOS CRÍTICOS:');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'server.ts',
  'Dockerfile',
  'package.json',
  'next.config.ts',
  'prisma/schema.prisma'
];

criticalFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath}: Existe`);
  } else {
    console.log(`❌ ${filePath}: FALTANTE`);
  }
});

// Verificar configuración del servidor
console.log('\n🖥️  CONFIGURACIÓN DEL SERVIDOR:');
try {
  const serverContent = fs.readFileSync('server.ts', 'utf8');
  
  if (serverContent.includes("process.env.PORT || '3000'")) {
    console.log('✅ server.ts: Puerto 3000 configurado correctamente');
  } else if (serverContent.includes("process.env.PORT || '4000'")) {
    console.log('❌ server.ts: Usando puerto 4000 (debe ser 3000 para Easypanel)');
  } else {
    console.log('⚠️  server.ts: Configuración de puerto no encontrada');
  }
  
  if (serverContent.includes("'0.0.0.0'")) {
    console.log('✅ server.ts: Hostname 0.0.0.0 configurado para Docker');
  } else {
    console.log('⚠️  server.ts: Hostname puede no estar configurado para Docker');
  }
} catch (error) {
  console.log('❌ server.ts: Error al leer archivo');
}

// Verificar Dockerfile
console.log('\n🐳 CONFIGURACIÓN DOCKER:');
try {
  const dockerContent = fs.readFileSync('Dockerfile', 'utf8');
  
  if (dockerContent.includes('EXPOSE 3000')) {
    console.log('✅ Dockerfile: Puerto 3000 expuesto');
  } else {
    console.log('❌ Dockerfile: Puerto 3000 no expuesto');
  }
  
  if (dockerContent.includes('PORT=3000')) {
    console.log('✅ Dockerfile: Variable PORT=3000 configurada');
  } else {
    console.log('⚠️  Dockerfile: Variable PORT=3000 no encontrada en CMD');
  }
} catch (error) {
  console.log('❌ Dockerfile: Error al leer archivo');
}

// Verificar package.json
console.log('\n📦 DEPENDENCIAS:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const criticalDeps = [
    '@whiskeysockets/baileys',
    'groq-sdk',
    'prisma',
    'next',
    'express',
    'socket.io'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: FALTANTE`);
    }
  });
  
  // Verificar scripts
  if (packageJson.scripts.start) {
    console.log(`✅ Script start: ${packageJson.scripts.start}`);
  } else {
    console.log('❌ Script start: FALTANTE');
  }
  
} catch (error) {
  console.log('❌ package.json: Error al leer archivo');
}

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(50));

if (criticalMissing === 0) {
  console.log('✅ VARIABLES CRÍTICAS: Todas configuradas');
} else {
  console.log(`❌ VARIABLES CRÍTICAS: ${criticalMissing} faltantes`);
}

console.log(`⚠️  VARIABLES OPCIONALES: ${optionalMissing} no configuradas`);

console.log('\n🎯 ESTADO PARA EASYPANEL:');
if (criticalMissing === 0) {
  console.log('✅ LISTO PARA DEPLOY - Todas las configuraciones críticas están OK');
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. Configurar variables de entorno en Easypanel');
  console.log('2. Hacer git push');
  console.log('3. Pull changes en Easypanel');
  console.log('4. Rebuild');
  console.log('5. Verificar que la app abre');
} else {
  console.log('❌ NO LISTO - Faltan configuraciones críticas');
  console.log('\n🔧 ACCIONES REQUERIDAS:');
  console.log('1. Configurar variables de entorno faltantes');
  console.log('2. Verificar archivos críticos');
  console.log('3. Ejecutar este script nuevamente');
}

console.log('\n💡 AYUDA:');
console.log('- Ver SOLUCION_EASYPANEL_DEFINITIVA.md para guía completa');
console.log('- Variables mínimas: DATABASE_URL, NEXTAUTH_SECRET, PORT=3000');
console.log('- Para funcionalidad completa: agregar GROQ_API_KEY');

console.log('\n🚀 ¡Éxito en el deploy!');
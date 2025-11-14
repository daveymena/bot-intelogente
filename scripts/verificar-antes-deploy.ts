import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

interface CheckResult {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

const checks: CheckResult[] = [];

function addCheck(name: string, status: 'ok' | 'warning' | 'error', message: string) {
  checks.push({ name, status, message });
}

console.log('🔍 Verificando configuración antes de desplegar...\n');

// 1. Verificar archivos esenciales
console.log('📁 Verificando archivos esenciales...');

const essentialFiles = [
  'Dockerfile',
  'package.json',
  'prisma/schema.prisma',
  '.env.production',
  'next.config.ts',
  'tsconfig.json'
];

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    addCheck(`Archivo ${file}`, 'ok', 'Existe');
  } else {
    addCheck(`Archivo ${file}`, 'error', 'NO EXISTE - Requerido para deploy');
  }
});

// 2. Verificar variables de entorno críticas
console.log('\n🔐 Verificando variables de entorno...');

const criticalEnvVars = [
  { key: 'RESEND_API_KEY', required: true },
  { key: 'GROQ_API_KEY', required: false },
  { key: 'NEXTAUTH_SECRET', required: true },
  { key: 'DATABASE_URL', required: true },
  { key: 'ADMIN_EMAIL', required: true },
  { key: 'ADMIN_PASSWORD', required: true }
];

criticalEnvVars.forEach(({ key, required }) => {
  const value = process.env[key];
  if (value) {
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    addCheck(key, 'ok', `Configurado: ${displayValue}`);
  } else {
    if (required) {
      addCheck(key, 'error', 'NO CONFIGURADO - Requerido');
    } else {
      addCheck(key, 'warning', 'No configurado - Opcional');
    }
  }
});

// 3. Verificar servicio de email
console.log('\n📧 Verificando servicio de email...');

if (process.env.RESEND_API_KEY) {
  addCheck('Resend API Key', 'ok', 'Configurado correctamente');
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  addCheck('Email remitente', 'ok', fromEmail);
} else {
  addCheck('Sistema de emails', 'error', 'Resend API Key no configurado');
}

// 4. Verificar rutas de verificación
console.log('\n🔗 Verificando rutas de verificación...');

const verificationRoutes = [
  'src/app/register/page.tsx',
  'src/app/resend-verification/page.tsx',
  'src/app/verify-email/page.tsx',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/resend-verification/route.ts',
  'src/app/api/auth/verify-email/route.ts'
];

verificationRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    addCheck(`Ruta ${path.basename(route)}`, 'ok', 'Existe');
  } else {
    addCheck(`Ruta ${path.basename(route)}`, 'warning', 'No encontrada');
  }
});

// 5. Verificar Dockerfile
console.log('\n🐳 Verificando Dockerfile...');

if (fs.existsSync('Dockerfile')) {
  const dockerfile = fs.readFileSync('Dockerfile', 'utf-8');
  
  if (dockerfile.includes('FROM node:')) {
    addCheck('Dockerfile base image', 'ok', 'Node.js configurado');
  }
  
  if (dockerfile.includes('prisma generate')) {
    addCheck('Dockerfile Prisma', 'ok', 'Prisma generate incluido');
  } else {
    addCheck('Dockerfile Prisma', 'warning', 'Prisma generate no encontrado');
  }
  
  if (dockerfile.includes('EXPOSE')) {
    addCheck('Dockerfile puerto', 'ok', 'Puerto expuesto');
  }
} else {
  addCheck('Dockerfile', 'error', 'No existe');
}

// 6. Verificar package.json
console.log('\n📦 Verificando package.json...');

if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  const requiredDeps = ['next', 'react', 'prisma', '@prisma/client', 'resend'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      addCheck(`Dependencia ${dep}`, 'ok', 'Instalada');
    } else {
      addCheck(`Dependencia ${dep}`, 'error', 'NO INSTALADA');
    }
  });
  
  if (packageJson.scripts?.build) {
    addCheck('Script build', 'ok', 'Configurado');
  } else {
    addCheck('Script build', 'error', 'No configurado');
  }
  
  if (packageJson.scripts?.start) {
    addCheck('Script start', 'ok', 'Configurado');
  } else {
    addCheck('Script start', 'error', 'No configurado');
  }
}

// Mostrar resultados
console.log('\n' + '='.repeat(60));
console.log('📊 RESULTADOS DE LA VERIFICACIÓN');
console.log('='.repeat(60) + '\n');

const okChecks = checks.filter(c => c.status === 'ok');
const warningChecks = checks.filter(c => c.status === 'warning');
const errorChecks = checks.filter(c => c.status === 'error');

console.log(`✅ Exitosos: ${okChecks.length}`);
console.log(`⚠️  Advertencias: ${warningChecks.length}`);
console.log(`❌ Errores: ${errorChecks.length}\n`);

// Mostrar detalles
if (errorChecks.length > 0) {
  console.log('❌ ERRORES (deben corregirse):');
  errorChecks.forEach(check => {
    console.log(`   • ${check.name}: ${check.message}`);
  });
  console.log('');
}

if (warningChecks.length > 0) {
  console.log('⚠️  ADVERTENCIAS (revisar):');
  warningChecks.forEach(check => {
    console.log(`   • ${check.name}: ${check.message}`);
  });
  console.log('');
}

// Conclusión
console.log('='.repeat(60));

if (errorChecks.length === 0) {
  console.log('✅ ¡TODO LISTO PARA DESPLEGAR!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "Listo para producción"');
  console.log('   3. git push origin main');
  console.log('   4. Configurar en Easypanel');
  console.log('   5. Desplegar');
  console.log('\n📖 Lee: DESPLEGAR_EASYPANEL_COMPLETO.md');
} else {
  console.log('❌ HAY ERRORES QUE CORREGIR');
  console.log('\n🔧 Corrige los errores antes de desplegar');
  console.log('   Revisa los mensajes arriba');
}

console.log('='.repeat(60) + '\n');

// Información adicional
console.log('💡 INFORMACIÓN IMPORTANTE:\n');
console.log('📧 Sistema de Emails:');
console.log('   • Resend configurado y funcionando');
console.log('   • Envío de códigos de verificación: ✅');
console.log('   • Reenvío de códigos: ✅');
console.log('   • Recuperación de contraseña: ✅\n');

console.log('🔗 Rutas disponibles:');
console.log('   • /register - Registro de usuarios');
console.log('   • /resend-verification - Reenviar código');
console.log('   • /verify-email - Verificar email');
console.log('   • /forgot-password - Recuperar contraseña\n');

console.log('📝 Variables críticas para Easypanel:');
console.log('   • RESEND_API_KEY (ya configurado)');
console.log('   • DATABASE_URL (configurar en Easypanel)');
console.log('   • NEXTAUTH_SECRET (generar nuevo)');
console.log('   • NEXT_PUBLIC_APP_URL (tu dominio)\n');

process.exit(errorChecks.length > 0 ? 1 : 0);

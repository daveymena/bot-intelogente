/**
 * 🔍 Diagnóstico de Conexión WhatsApp
 * Verifica el estado del sistema de conexión y detecta problemas
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('🔍 DIAGNÓSTICO DE CONEXIÓN WHATSAPP');
console.log('========================================\n');

const results = {
  archivos: { ok: 0, error: 0 },
  configuracion: { ok: 0, error: 0 },
  sesiones: { ok: 0, error: 0 }
};

// 1. Verificar archivos necesarios
console.log('[1/3] Verificando archivos del sistema...\n');

const archivosNecesarios = [
  'src/lib/baileys-stable-service.ts',
  'src/app/api/whatsapp/connect/route.ts',
  'src/app/api/whatsapp/status/route.ts',
  'src/app/api/whatsapp/cleanup/route.ts',
  'src/app/api/whatsapp/reconnect/route.ts',
  'src/components/dashboard/WhatsAppConnection.tsx'
];

archivosNecesarios.forEach(archivo => {
  if (fs.existsSync(archivo)) {
    console.log(`✅ ${archivo}`);
    results.archivos.ok++;
  } else {
    console.log(`❌ ${archivo} - NO ENCONTRADO`);
    results.archivos.error++;
  }
});

// 2. Verificar configuración
console.log('\n[2/3] Verificando configuración...\n');

const envPath = '.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  const configuraciones = [
    { key: 'GROQ_API_KEY', required: true },
    { key: 'DATABASE_URL', required: true },
    { key: 'WHATSAPP_AUTO_RECONNECT', required: false },
    { key: 'WHATSAPP_KEEP_ALIVE_INTERVAL', required: false },
    { key: 'WHATSAPP_MAX_RECONNECT_ATTEMPTS', required: false }
  ];
  
  configuraciones.forEach(config => {
    const regex = new RegExp(`^${config.key}=`, 'm');
    if (regex.test(envContent)) {
      console.log(`✅ ${config.key} configurado`);
      results.configuracion.ok++;
    } else {
      if (config.required) {
        console.log(`❌ ${config.key} - REQUERIDO pero no configurado`);
        results.configuracion.error++;
      } else {
        console.log(`⚠️  ${config.key} - Opcional, usando valor por defecto`);
        results.configuracion.ok++;
      }
    }
  });
} else {
  console.log('❌ Archivo .env no encontrado');
  results.configuracion.error++;
}

// 3. Verificar sesiones activas
console.log('\n[3/3] Verificando sesiones de WhatsApp...\n');

const authSessionsDir = 'auth_sessions';
if (fs.existsSync(authSessionsDir)) {
  const usuarios = fs.readdirSync(authSessionsDir);
  
  if (usuarios.length === 0) {
    console.log('ℹ️  No hay sesiones activas');
    results.sesiones.ok++;
  } else {
    console.log(`📁 Sesiones encontradas: ${usuarios.length}\n`);
    
    usuarios.forEach(userId => {
      const userDir = path.join(authSessionsDir, userId);
      const archivos = fs.readdirSync(userDir);
      
      console.log(`Usuario: ${userId}`);
      console.log(`  Archivos: ${archivos.length}`);
      
      if (archivos.length > 0) {
        console.log(`  ✅ Sesión válida (${archivos.length} archivos)`);
        results.sesiones.ok++;
      } else {
        console.log(`  ⚠️  Sesión vacía (sin archivos)`);
        results.sesiones.error++;
      }
      console.log('');
    });
  }
} else {
  console.log('ℹ️  Directorio auth_sessions no existe (se creará al conectar)');
  results.sesiones.ok++;
}

// Resumen
console.log('========================================');
console.log('📊 RESUMEN DEL DIAGNÓSTICO');
console.log('========================================\n');

const totalOk = results.archivos.ok + results.configuracion.ok + results.sesiones.ok;
const totalError = results.archivos.error + results.configuracion.error + results.sesiones.error;

console.log(`Archivos:       ${results.archivos.ok} OK, ${results.archivos.error} Error`);
console.log(`Configuración:  ${results.configuracion.ok} OK, ${results.configuracion.error} Error`);
console.log(`Sesiones:       ${results.sesiones.ok} OK, ${results.sesiones.error} Error`);
console.log('');
console.log(`TOTAL:          ${totalOk} OK, ${totalError} Error`);
console.log('');

// Recomendaciones
if (totalError > 0) {
  console.log('⚠️  RECOMENDACIONES:\n');
  
  if (results.archivos.error > 0) {
    console.log('- Verifica que todos los archivos del sistema estén presentes');
    console.log('- Ejecuta: git pull para actualizar el código');
  }
  
  if (results.configuracion.error > 0) {
    console.log('- Configura las variables requeridas en .env');
    console.log('- Copia .env.example a .env si no existe');
  }
  
  if (results.sesiones.error > 0) {
    console.log('- Limpia las sesiones vacías o corruptas');
    console.log('- Usa el botón "Limpiar y Generar Nuevo QR" en el dashboard');
  }
  
  console.log('');
} else {
  console.log('✅ Sistema configurado correctamente\n');
  console.log('Para conectar WhatsApp:');
  console.log('1. Inicia el servidor: npm run dev');
  console.log('2. Ve al dashboard de WhatsApp');
  console.log('3. Haz clic en "Conectar WhatsApp"');
  console.log('4. Escanea el código QR');
  console.log('');
}

// Información adicional
console.log('========================================');
console.log('📚 DOCUMENTACIÓN');
console.log('========================================\n');
console.log('- SOLUCION_QR_Y_CONEXION_AUTOMATICA.md');
console.log('- CONFIGURACION_WHATSAPP_RECOMENDADA.md');
console.log('');

console.log('========================================');
console.log('🔧 COMANDOS ÚTILES');
console.log('========================================\n');
console.log('Iniciar servidor:');
console.log('  npm run dev');
console.log('');
console.log('Limpiar sesiones:');
console.log('  rmdir /s /q auth_sessions (Windows)');
console.log('  rm -rf auth_sessions (Linux/Mac)');
console.log('');
console.log('Ver logs en tiempo real:');
console.log('  npm run dev | findstr "Baileys"');
console.log('');

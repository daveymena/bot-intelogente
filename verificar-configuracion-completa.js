/**
 * Verifica que la configuración esté correcta
 */

const fs = require('fs');
const path = require('path');

function verificarConfiguracion() {
  console.log('⚙️  Verificando configuración...\n');

  let errores = 0;

  // 1. Verificar .env
  console.log('[1/4] Verificando .env...');
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Archivo .env NO existe');
    errores++;
  } else {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const variablesRequeridas = [
      { key: 'DATABASE_URL', critico: true },
      { key: 'USE_OLLAMA', valor: 'true' },
      { key: 'OLLAMA_BASE_URL', critico: true },
      { key: 'OLLAMA_TIMEOUT', recomendado: '60000' },
      { key: 'GROQ_API_KEY', critico: false },
    ];

    variablesRequeridas.forEach(variable => {
      const regex = new RegExp(`${variable.key}=(.+)`, 'i');
      const match = envContent.match(regex);
      
      if (match) {
        const valor = match[1].trim();
        console.log(`   ✅ ${variable.key}=${valor.substring(0, 30)}...`);
        
        if (variable.valor && valor !== variable.valor) {
          console.log(`      ⚠️  Recomendado: ${variable.valor}`);
        }
        
        if (variable.recomendado && valor !== variable.recomendado) {
          console.log(`      💡 Sugerencia: ${variable.recomendado}`);
        }
      } else {
        if (variable.critico) {
          console.log(`   ❌ ${variable.key} NO encontrado (CRÍTICO)`);
          errores++;
        } else {
          console.log(`   ⚠️  ${variable.key} NO encontrado (opcional)`);
        }
      }
    });
  }
  console.log('');

  // 2. Verificar archivos críticos
  console.log('[2/4] Verificando archivos críticos...');
  const archivosCriticos = [
    'src/lib/simple-conversation-handler.ts',
    'src/lib/specific-product-finder.ts',
    'src/lib/card-photo-sender.ts',
    'src/lib/real-data-enforcer.ts',
    'src/conversational-module/services/photoService.ts',
    'src/conversational-module/ai/conversacionController.ts',
  ];

  archivosCriticos.forEach(archivo => {
    const filePath = path.join(__dirname, archivo);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`   ✅ ${archivo} (${stats.size} bytes)`);
    } else {
      console.log(`   ❌ ${archivo} NO existe`);
      errores++;
    }
  });
  console.log('');

  // 3. Verificar estructura de directorios
  console.log('[3/4] Verificando estructura de directorios...');
  const directorios = [
    'src/lib',
    'src/conversational-module',
    'src/conversational-module/services',
    'src/conversational-module/ai',
    'scripts',
    'prisma',
  ];

  directorios.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   ✅ ${dir}/`);
    } else {
      console.log(`   ❌ ${dir}/ NO existe`);
      errores++;
    }
  });
  console.log('');

  // 4. Verificar package.json
  console.log('[4/4] Verificando package.json...');
  const packagePath = path.join(__dirname, 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const dependenciasCriticas = [
      '@whiskeysockets/baileys',
      'groq-sdk',
      '@prisma/client',
      'next',
      'react',
    ];

    dependenciasCriticas.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`   ❌ ${dep} NO instalado`);
        errores++;
      }
    });
  } else {
    console.log('   ❌ package.json NO existe');
    errores++;
  }
  console.log('');

  // Resumen
  if (errores === 0) {
    console.log('✅ Configuración correcta\n');
    return 0;
  } else {
    console.log(`⚠️  ${errores} problema(s) detectado(s)\n`);
    return 1;
  }
}

const exitCode = verificarConfiguracion();
process.exit(exitCode);

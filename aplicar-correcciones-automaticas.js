/**
 * Aplica correcciones automáticas al sistema
 */

const fs = require('fs');
const path = require('path');

function aplicarCorrecciones() {
  console.log('🔧 Aplicando correcciones automáticas...\n');

  let correccionesAplicadas = 0;

  // 1. Verificar y corregir .env
  console.log('[1/3] Verificando .env...');
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    let modificado = false;

    // Asegurar USE_OLLAMA=true
    if (!envContent.includes('USE_OLLAMA=true')) {
      if (envContent.includes('USE_OLLAMA=')) {
        envContent = envContent.replace(/USE_OLLAMA=.+/g, 'USE_OLLAMA=true');
        console.log('   ✅ Corregido: USE_OLLAMA=true');
        modificado = true;
        correccionesAplicadas++;
      } else {
        envContent += '\nUSE_OLLAMA=true\n';
        console.log('   ✅ Agregado: USE_OLLAMA=true');
        modificado = true;
        correccionesAplicadas++;
      }
    } else {
      console.log('   ✓ USE_OLLAMA ya está en true');
    }

    // Asegurar OLLAMA_TIMEOUT adecuado
    if (envContent.includes('OLLAMA_TIMEOUT=')) {
      const match = envContent.match(/OLLAMA_TIMEOUT=(\d+)/);
      if (match && parseInt(match[1]) < 60000) {
        envContent = envContent.replace(/OLLAMA_TIMEOUT=\d+/, 'OLLAMA_TIMEOUT=60000');
        console.log('   ✅ Corregido: OLLAMA_TIMEOUT=60000');
        modificado = true;
        correccionesAplicadas++;
      } else {
        console.log('   ✓ OLLAMA_TIMEOUT ya está configurado correctamente');
      }
    } else {
      envContent += '\nOLLAMA_TIMEOUT=60000\n';
      console.log('   ✅ Agregado: OLLAMA_TIMEOUT=60000');
      modificado = true;
      correccionesAplicadas++;
    }

    if (modificado) {
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('   💾 Archivo .env actualizado');
    }
  } else {
    console.log('   ⚠️  Archivo .env no existe, no se puede corregir');
  }
  console.log('');

  // 2. Verificar archivos críticos
  console.log('[2/3] Verificando archivos críticos...');
  
  // Verificar specific-product-finder.ts
  const specificFinderPath = path.join(__dirname, 'src', 'lib', 'specific-product-finder.ts');
  if (fs.existsSync(specificFinderPath)) {
    const content = fs.readFileSync(specificFinderPath, 'utf8');
    if (content.length < 100 || !content.includes('findSpecificProduct')) {
      console.log('   ⚠️  specific-product-finder.ts parece corrupto');
      console.log('   💡 Se recomienda recrearlo manualmente');
    } else {
      console.log('   ✓ specific-product-finder.ts OK');
    }
  } else {
    console.log('   ⚠️  specific-product-finder.ts no existe');
  }
  console.log('');

  // 3. Crear archivo de configuración de logs
  console.log('[3/3] Configurando sistema de logs...');
  const logConfigPath = path.join(__dirname, 'log-config.json');
  
  const logConfig = {
    enabled: true,
    level: 'debug',
    modules: {
      'SimpleHandler': true,
      'BuscarProductos': true,
      'PhotoService': true,
      'RealDataEnforcer': true,
      'Conversación': true
    },
    timestamp: true,
    colors: true
  };

  fs.writeFileSync(logConfigPath, JSON.stringify(logConfig, null, 2), 'utf8');
  console.log('   ✅ Configuración de logs creada');
  correccionesAplicadas++;
  console.log('');

  // Resumen
  console.log('═══════════════════════════════════════');
  console.log(`✅ ${correccionesAplicadas} corrección(es) aplicada(s)`);
  console.log('═══════════════════════════════════════\n');

  if (correccionesAplicadas > 0) {
    console.log('⚠️  IMPORTANTE: Reinicia el servidor para aplicar cambios\n');
  }

  return 0;
}

const exitCode = aplicarCorrecciones();
process.exit(exitCode);

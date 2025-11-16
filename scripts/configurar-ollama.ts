import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 🔧 CONFIGURAR OLLAMA AUTOMÁTICAMENTE
 * Actualiza el .env con la configuración correcta de Ollama
 */

async function configurarOllama() {
  console.log('🔧 CONFIGURANDO OLLAMA\n');
  console.log('='.repeat(60));

  const envPath = join(process.cwd(), '.env');
  
  if (!existsSync(envPath)) {
    console.error('❌ Archivo .env no encontrado');
    console.log('💡 Crea uno copiando .env.example');
    process.exit(1);
  }

  // Leer .env actual
  let envContent = readFileSync(envPath, 'utf-8');
  
  // Configuración recomendada
  const config = {
    OLLAMA_BASE_URL: 'http://localhost:11434',
    OLLAMA_MODEL: 'gemma3:4b',
    OLLAMA_ENABLED: 'true',
    OLLAMA_TIMEOUT: '60000',
    OLLAMA_MAX_TOKENS: '500'
  };

  console.log('\n📝 Configuración a aplicar:');
  console.log('-'.repeat(60));
  
  let cambios = 0;
  
  for (const [key, value] of Object.entries(config)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      // Actualizar valor existente
      const oldValue = envContent.match(regex)?.[0];
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`✏️  ${key}: ${oldValue?.split('=')[1]} → ${value}`);
      cambios++;
    } else {
      // Agregar nueva variable
      envContent += `\n${key}=${value}`;
      console.log(`➕ ${key}=${value}`);
      cambios++;
    }
  }

  if (cambios > 0) {
    // Guardar .env actualizado
    writeFileSync(envPath, envContent);
    console.log(`\n✅ ${cambios} cambios aplicados en .env`);
  } else {
    console.log('\n✅ Configuración ya está correcta');
  }

  // Verificar Ollama
  console.log('\n🔍 Verificando Ollama...');
  console.log('-'.repeat(60));

  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      
      console.log(`✅ Ollama conectado (${models.length} modelos)`);
      
      const hasGemma3 = models.some((m: any) => m.name.includes('gemma3:4b'));
      
      if (hasGemma3) {
        console.log('✅ gemma3:4b instalado');
      } else {
        console.log('⚠️  gemma3:4b NO instalado');
        console.log('\n💡 Instálalo con:');
        console.log('   ollama pull gemma3:4b');
      }

      console.log('\n📦 Modelos disponibles:');
      models.forEach((m: any) => {
        console.log(`   • ${m.name} (${(m.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
      });
    } else {
      console.log('❌ Ollama no responde');
      mostrarInstrucciones();
    }
  } catch (error: any) {
    console.log('❌ No se puede conectar a Ollama');
    mostrarInstrucciones();
  }

  console.log('\n✅ Configuración completada\n');
}

function mostrarInstrucciones() {
  console.log('\n💡 INSTRUCCIONES:');
  console.log('-'.repeat(60));
  console.log('1. Instalar Ollama:');
  console.log('   https://ollama.com/download');
  console.log('');
  console.log('2. Descargar modelo:');
  console.log('   ollama pull gemma3:4b');
  console.log('');
  console.log('3. Verificar:');
  console.log('   ollama list');
  console.log('');
  console.log('4. Probar:');
  console.log('   npm run ollama:test');
}

// Ejecutar
configurarOllama().catch(console.error);

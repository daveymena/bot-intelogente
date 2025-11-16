import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 🔧 ACTIVAR OLLAMA COMO PRINCIPAL
 * Cambia el orden de fallback para usar Ollama primero
 */

async function activarOllamaPrincipal() {
  console.log('🔧 ACTIVANDO OLLAMA COMO PRINCIPAL\n');
  console.log('='.repeat(60));

  const envPath = join(process.cwd(), '.env');
  
  if (!existsSync(envPath)) {
    console.error('❌ Archivo .env no encontrado');
    process.exit(1);
  }

  // Leer .env actual
  let envContent = readFileSync(envPath, 'utf-8');
  
  // Configuración para Ollama como principal
  const config = {
    AI_FALLBACK_ORDER: 'ollama,groq,openrouter,lmstudio',
    OLLAMA_ENABLED: 'true',
    OLLAMA_BASE_URL: 'http://localhost:11434',
    OLLAMA_MODEL: 'gemma3:4b',
    OLLAMA_TIMEOUT: '60000',
    OLLAMA_MAX_TOKENS: '500'
  };

  console.log('\n📝 Configuración a aplicar:');
  console.log('-'.repeat(60));
  console.log('🦙 Ollama → Groq → OpenRouter → LM Studio');
  console.log('');
  
  let cambios = 0;
  
  for (const [key, value] of Object.entries(config)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      const oldValue = envContent.match(regex)?.[0];
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`✏️  ${key}: ${oldValue?.split('=')[1]} → ${value}`);
      cambios++;
    } else {
      envContent += `\n${key}=${value}`;
      console.log(`➕ ${key}=${value}`);
      cambios++;
    }
  }

  // Guardar .env actualizado
  writeFileSync(envPath, envContent);
  console.log(`\n✅ ${cambios} cambios aplicados en .env`);

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
        console.log('✅ gemma3:4b instalado y listo');
      } else {
        console.log('⚠️  gemma3:4b NO instalado');
        console.log('\n💡 Instálalo con:');
        console.log('   ollama pull gemma3:4b');
        process.exit(1);
      }
    } else {
      console.log('❌ Ollama no responde');
      console.log('\n💡 Asegúrate de que Ollama esté corriendo:');
      console.log('   ollama serve');
      process.exit(1);
    }
  } catch (error: any) {
    console.log('❌ No se puede conectar a Ollama');
    console.log('\n💡 Verifica:');
    console.log('   1. Ollama instalado: https://ollama.com/download');
    console.log('   2. Ollama corriendo: ollama serve');
    console.log('   3. Modelo descargado: ollama pull gemma3:4b');
    process.exit(1);
  }

  console.log('\n⚠️  IMPORTANTE:');
  console.log('-'.repeat(60));
  console.log('Ollama es 10-30x más lento que Groq');
  console.log('Respuestas tomarán 8-30 segundos');
  console.log('Úsalo solo para pruebas, no para producción');
  console.log('');
  console.log('Para volver a Groq como principal:');
  console.log('   npm run activar-groq-principal');

  console.log('\n✅ Ollama activado como principal\n');
  console.log('🚀 Reinicia el bot para aplicar cambios:');
  console.log('   npm run dev');
}

// Ejecutar
activarOllamaPrincipal().catch(console.error);

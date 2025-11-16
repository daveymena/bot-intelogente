import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 🚀 FORZAR OLLAMA DESHABILITANDO GROQ
 * Deshabilita temporalmente Groq para forzar uso de Ollama
 */

async function forzarOllama() {
  console.log('🚀 FORZANDO USO DE OLLAMA\n');
  console.log('='.repeat(60));

  const envPath = join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');

  // Deshabilitar Groq temporalmente (comentar la key principal)
  const groqKeyRegex = /^GROQ_API_KEY=(.+)$/m;
  if (groqKeyRegex.test(envContent)) {
    envContent = envContent.replace(groqKeyRegex, '#GROQ_API_KEY=$1  # DESHABILITADO TEMPORALMENTE');
    console.log('✅ Groq deshabilitado temporalmente');
  }

  // Habilitar Ollama
  const ollamaEnabledRegex = /^OLLAMA_ENABLED=.*/m;
  if (ollamaEnabledRegex.test(envContent)) {
    envContent = envContent.replace(ollamaEnabledRegex, 'OLLAMA_ENABLED=true');
  } else {
    envContent += '\nOLLAMA_ENABLED=true';
  }

  writeFileSync(envPath, envContent);

  console.log('\n✅ Configuración actualizada:');
  console.log('   GROQ_API_KEY=# (deshabilitado)');
  console.log('   OLLAMA_ENABLED=true');

  console.log('\n📱 Ahora reinicia el bot:');
  console.log('   npm run dev');

  console.log('\n⏱️  Tiempos esperados:');
  console.log('   • Primera respuesta: ~48 segundos');
  console.log('   • Respuestas siguientes: ~15-30 segundos');

  console.log('\n🔄 Para restaurar Groq:');
  console.log('   npm run restaurar:groq');

  console.log('\n⚠️  IMPORTANTE: Esto es solo para pruebas\n');
}

forzarOllama().catch(console.error);

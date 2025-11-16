import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * ⚠️ ACTIVAR OLLAMA COMO PRINCIPAL (TEMPORAL)
 * Solo para pruebas - Ollama es 30x más lento que Groq
 */

async function activarOllamaTemporal() {
  console.log('⚠️  ACTIVAR OLLAMA COMO PRINCIPAL\n');
  console.log('='.repeat(60));
  console.log('⚠️  ADVERTENCIA: Ollama es 30x más lento que Groq');
  console.log('⚠️  Respuestas tardarán 15-30 segundos');
  console.log('⚠️  Solo para pruebas temporales\n');

  const envPath = join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');

  // Configurar Ollama como primero en el orden de fallback
  const aiProviderRegex = /^AI_PROVIDER=.*/m;
  const ollamaEnabledRegex = /^OLLAMA_ENABLED=.*/m;
  const fallbackOrderRegex = /^AI_FALLBACK_ORDER=.*/m;
  const fallbackEnabledRegex = /^AI_FALLBACK_ENABLED=.*/m;

  if (aiProviderRegex.test(envContent)) {
    envContent = envContent.replace(aiProviderRegex, 'AI_PROVIDER=ollama');
  } else {
    envContent += '\nAI_PROVIDER=ollama';
  }

  if (ollamaEnabledRegex.test(envContent)) {
    envContent = envContent.replace(ollamaEnabledRegex, 'OLLAMA_ENABLED=true');
  } else {
    envContent += '\nOLLAMA_ENABLED=true';
  }

  if (fallbackOrderRegex.test(envContent)) {
    envContent = envContent.replace(fallbackOrderRegex, 'AI_FALLBACK_ORDER=ollama,groq');
  } else {
    envContent += '\nAI_FALLBACK_ORDER=ollama,groq';
  }

  if (fallbackEnabledRegex.test(envContent)) {
    envContent = envContent.replace(fallbackEnabledRegex, 'AI_FALLBACK_ENABLED=true');
  } else {
    envContent += '\nAI_FALLBACK_ENABLED=true';
  }

  writeFileSync(envPath, envContent);

  console.log('✅ Configuración actualizada:');
  console.log('   AI_PROVIDER=ollama');
  console.log('   AI_FALLBACK_ORDER=ollama,groq');
  console.log('   OLLAMA_ENABLED=true');
  console.log('   AI_FALLBACK_ENABLED=true');

  console.log('\n📱 Para probar desde tu celular:');
  console.log('   1. Reinicia el bot: npm run dev');
  console.log('   2. Envía mensaje por WhatsApp');
  console.log('   3. Espera 15-30 segundos por respuesta');

  console.log('\n⏱️  Tiempos esperados:');
  console.log('   • Primera respuesta: ~48 segundos');
  console.log('   • Respuestas siguientes: ~15-30 segundos');

  console.log('\n🔄 Para volver a Groq:');
  console.log('   npm run activar:groq');

  console.log('\n⚠️  RECUERDA: Esto es solo para pruebas');
  console.log('⚠️  No uses Ollama en producción como principal\n');
}

activarOllamaTemporal().catch(console.error);

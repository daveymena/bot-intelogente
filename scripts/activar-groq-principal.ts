import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * ✅ RESTAURAR GROQ COMO PRINCIPAL
 * Volver a la configuración normal (rápida)
 */

async function activarGroqPrincipal() {
  console.log('✅ RESTAURAR GROQ COMO PRINCIPAL\n');
  console.log('='.repeat(60));

  const envPath = join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');

  // Configurar Groq como primero en el orden de fallback
  const aiProviderRegex = /^AI_PROVIDER=.*/m;
  const ollamaEnabledRegex = /^OLLAMA_ENABLED=.*/m;
  const fallbackOrderRegex = /^AI_FALLBACK_ORDER=.*/m;
  const fallbackEnabledRegex = /^AI_FALLBACK_ENABLED=.*/m;

  if (aiProviderRegex.test(envContent)) {
    envContent = envContent.replace(aiProviderRegex, 'AI_PROVIDER=groq');
  } else {
    envContent += '\nAI_PROVIDER=groq';
  }

  if (ollamaEnabledRegex.test(envContent)) {
    envContent = envContent.replace(ollamaEnabledRegex, 'OLLAMA_ENABLED=true');
  } else {
    envContent += '\nOLLAMA_ENABLED=true';
  }

  if (fallbackOrderRegex.test(envContent)) {
    envContent = envContent.replace(fallbackOrderRegex, 'AI_FALLBACK_ORDER=groq,ollama');
  } else {
    envContent += '\nAI_FALLBACK_ORDER=groq,ollama';
  }

  if (fallbackEnabledRegex.test(envContent)) {
    envContent = envContent.replace(fallbackEnabledRegex, 'AI_FALLBACK_ENABLED=true');
  } else {
    envContent += '\nAI_FALLBACK_ENABLED=true';
  }

  writeFileSync(envPath, envContent);

  console.log('✅ Configuración restaurada:');
  console.log('   AI_PROVIDER=groq');
  console.log('   AI_FALLBACK_ORDER=groq,ollama');
  console.log('   OLLAMA_ENABLED=true (como fallback)');
  console.log('   AI_FALLBACK_ENABLED=true');

  console.log('\n⚡ Flujo normal:');
  console.log('   1. Groq (8 keys) → 0.5-1s ⚡ Principal');
  console.log('   2. Ollama → 15-30s 🐌 Fallback');
  console.log('   3. Base Conocimiento → Respuestas guardadas');

  console.log('\n✅ Reinicia el bot para aplicar cambios:');
  console.log('   npm run dev\n');
}

activarGroqPrincipal().catch(console.error);

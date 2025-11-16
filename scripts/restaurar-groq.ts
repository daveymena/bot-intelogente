import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 🔄 RESTAURAR GROQ
 * Rehabilita Groq después de pruebas con Ollama
 */

async function restaurarGroq() {
  console.log('🔄 RESTAURANDO GROQ\n');
  console.log('='.repeat(60));

  const envPath = join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');

  // Rehabilitar Groq (descomentar la key)
  const groqKeyRegex = /^#GROQ_API_KEY=(.+?)  # DESHABILITADO TEMPORALMENTE$/m;
  if (groqKeyRegex.test(envContent)) {
    envContent = envContent.replace(groqKeyRegex, 'GROQ_API_KEY=$1');
    console.log('✅ Groq rehabilitado');
  } else {
    console.log('⚠️  Groq ya estaba habilitado');
  }

  writeFileSync(envPath, envContent);

  console.log('\n✅ Configuración restaurada:');
  console.log('   GROQ_API_KEY=activo');
  console.log('   OLLAMA_ENABLED=true (como fallback)');

  console.log('\n⚡ Reinicia el bot:');
  console.log('   npm run dev');

  console.log('\n✅ Vuelto a la normalidad (Groq principal)\n');
}

restaurarGroq().catch(console.error);

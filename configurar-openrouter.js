/**
 * Configurador de OpenRouter
 * Agrega OpenRouter como respaldo automático al sistema
 */

const fs = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = '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';

console.log('🌐 Configurando OpenRouter como respaldo...\n');

// Leer .env actual
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Archivo .env encontrado');
} else {
  console.log('⚠️ Archivo .env no existe, creando uno nuevo...');
}

// Verificar si OpenRouter ya está configurado
if (envContent.includes('OPENROUTER_API_KEY')) {
  console.log('⚠️ OpenRouter ya está configurado en .env');
  
  // Actualizar la API key si es diferente
  if (!envContent.includes(OPENROUTER_API_KEY)) {
    envContent = envContent.replace(
      /OPENROUTER_API_KEY=.*/,
      `OPENROUTER_API_KEY=${OPENROUTER_API_KEY}`
    );
    console.log('✅ API Key de OpenRouter actualizada');
  }
} else {
  // Agregar configuración de OpenRouter
  const openRouterConfig = `
# OpenRouter API (Respaldo - 50 mensajes/día gratis)
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
`;
  
  // Buscar la sección de IA y agregar después
  if (envContent.includes('GROQ_API_KEY')) {
    envContent = envContent.replace(
      /(GROQ_TIMEOUT=\d+)/,
      `$1\n${openRouterConfig}`
    );
  } else {
    envContent += openRouterConfig;
  }
  
  console.log('✅ Configuración de OpenRouter agregada');
}

// Verificar/actualizar orden de fallback
if (envContent.includes('AI_FALLBACK_ORDER')) {
  // Actualizar para incluir openrouter
  if (!envContent.includes('openrouter')) {
    envContent = envContent.replace(
      /AI_FALLBACK_ORDER=.*/,
      'AI_FALLBACK_ORDER=groq,openrouter,ollama'
    );
    console.log('✅ Orden de fallback actualizado para incluir OpenRouter');
  }
} else {
  // Agregar orden de fallback
  envContent += '\nAI_FALLBACK_ORDER=groq,openrouter,ollama\n';
  console.log('✅ Orden de fallback configurado');
}

// Verificar/agregar auto-detección
if (!envContent.includes('AI_AUTO_MODEL_DETECTION')) {
  envContent += 'AI_AUTO_MODEL_DETECTION=true\n';
  console.log('✅ Auto-detección de modelos habilitada');
}

// Guardar .env actualizado
fs.writeFileSync(envPath, envContent);

console.log('\n🎉 Configuración completada!\n');
console.log('📋 Resumen:');
console.log('   - OpenRouter API Key: Configurada ✓');
console.log('   - Modelo: meta-llama/llama-3.2-3b-instruct:free');
console.log('   - Límite: 50 mensajes/día gratis');
console.log('   - Orden de fallback: Groq → OpenRouter → Ollama');
console.log('   - Auto-detección: Habilitada');
console.log('\n💡 Cómo funciona:');
console.log('   1. Intenta con Groq (principal)');
console.log('   2. Si Groq falla → OpenRouter (50 msg/día)');
console.log('   3. Si OpenRouter falla → Ollama (local)');
console.log('\n✨ El bot ahora tiene triple respaldo automático!');

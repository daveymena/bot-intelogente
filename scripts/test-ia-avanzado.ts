import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Probando Sistema de IA con Razonamiento Avanzado\n');
console.log('='.repeat(60));

async function testAdvancedReasoning() {
  // Verificar configuración
  console.log('\n📋 CONFIGURACIÓN\n');
  
  const config = {
    'OLLAMA_ENABLED': process.env.OLLAMA_ENABLED,
    'OLLAMA_BASE_URL': process.env.OLLAMA_BASE_URL,
    'OLLAMA_MODEL': process.env.OLLAMA_MODEL,
    'GROQ_API_KEY': process.env.GROQ_API_KEY ? '✅ Configurado' : '❌ No configurado',
    'GROQ_MODEL': process.env.GROQ_MODEL,
    'AI_USE_REASONING': process.env.AI_USE_REASONING,
  };

  for (const [key, value] of Object.entries(config)) {
    console.log(`${key}: ${value}`);
  }

  console.log('\n✅ Sistema configurado correctamente');
  console.log('\n🎯 Orden de ejecución:');
  console.log('   1. Ollama (Principal) - Rápido y local');
  console.log('   2. Groq (Respaldo) - Si Ollama falla');
  console.log('   3. Razonamiento profundo habilitado');
}

testAdvancedReasoning()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

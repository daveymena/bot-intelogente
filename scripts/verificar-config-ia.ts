console.log('🔍 VERIFICANDO CONFIGURACIÓN DE IA\n');
console.log('='.repeat(50));

console.log('\n📊 Variables de Entorno:');
console.log(`OLLAMA_ENABLED: ${process.env.OLLAMA_ENABLED}`);
console.log(`AI_PROVIDER: ${process.env.AI_PROVIDER}`);
console.log(`AI_FALLBACK_ORDER: ${process.env.AI_FALLBACK_ORDER}`);
console.log(`AI_USE_REASONING: ${process.env.AI_USE_REASONING}`);
console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Configurado' : '❌ No configurado'}`);

console.log('\n' + '='.repeat(50));

if (process.env.OLLAMA_ENABLED === 'false') {
  console.log('✅ Ollama está DESACTIVADO (correcto)');
} else {
  console.log('⚠️  Ollama está ACTIVADO (debería estar desactivado)');
}

if (process.env.AI_PROVIDER === 'groq') {
  console.log('✅ Groq es el proveedor principal (correcto)');
} else {
  console.log(`⚠️  Proveedor principal: ${process.env.AI_PROVIDER} (debería ser groq)`);
}

if (process.env.AI_USE_REASONING === 'false') {
  console.log('✅ Razonamiento avanzado DESACTIVADO (correcto)');
} else {
  console.log('⚠️  Razonamiento avanzado ACTIVADO (debería estar desactivado)');
}

console.log('\n💡 Si ves advertencias, reinicia el servidor:\n');
console.log('   1. Detén el servidor (Ctrl+C)');
console.log('   2. Inicia de nuevo: npm run dev\n');

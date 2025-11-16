/**
 * 🧪 TEST: Verificar Ollama
 * 
 * Verifica que Ollama esté instalado y funcionando correctamente
 */

import { OllamaService } from '../src/lib/ollama-service';

async function testOllama() {
  console.log('🧪 TEST: Verificando Ollama\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Verificar disponibilidad
    console.log('1️⃣ Verificando conexión...');
    const isAvailable = await OllamaService.isAvailable();
    
    if (!isAvailable) {
      console.log('\n❌ Ollama no está disponible\n');
      console.log('📝 Pasos para solucionar:');
      console.log('1. Instalar Ollama: https://ollama.com/download');
      console.log('2. Descargar modelo: ollama pull gemma2:2b');
      console.log('3. Configurar .env: OLLAMA_ENABLED=true');
      console.log('4. Reiniciar el bot\n');
      return;
    }

    console.log('✅ Ollama está disponible\n');

    // 2. Listar modelos
    console.log('2️⃣ Listando modelos instalados...');
    const models = await OllamaService.listModels();
    
    if (models.length === 0) {
      console.log('⚠️  No hay modelos instalados\n');
      console.log('📝 Instala un modelo:');
      console.log('   ollama pull gemma2:2b\n');
      return;
    }

    console.log(`✅ ${models.length} modelo(s) instalado(s):`);
    models.forEach(model => console.log(`   - ${model}`));
    console.log('');

    // 3. Verificar modelo configurado
    console.log('3️⃣ Verificando modelo configurado...');
    const hasModel = await OllamaService.checkModel();
    
    if (!hasModel) {
      console.log('⚠️  El modelo configurado no está instalado\n');
      console.log('📝 Instala el modelo:');
      console.log(`   ollama pull ${process.env.OLLAMA_MODEL || 'gemma2:2b'}\n`);
      return;
    }

    console.log('✅ Modelo configurado está instalado\n');

    // 4. Probar generación de respuesta
    console.log('4️⃣ Probando generación de respuesta...');
    console.log('   Pregunta: "Hola, ¿cómo estás?"\n');

    const response = await OllamaService.generateResponse({
      systemPrompt: 'Eres un asistente amable y profesional.',
      messages: [
        { role: 'user', content: 'Hola, ¿cómo estás?' }
      ]
    });

    if (!response) {
      console.log('❌ No se pudo generar respuesta\n');
      return;
    }

    console.log('✅ Respuesta generada:');
    console.log(`   "${response.text}"`);
    console.log(`   Confianza: ${(response.confidence * 100).toFixed(0)}%\n`);

    // 5. Resumen
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ Ollama está funcionando correctamente');
    console.log(`✅ Modelo: ${process.env.OLLAMA_MODEL || 'gemma2:2b'}`);
    console.log(`✅ URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);
    console.log('✅ El bot puede usar Ollama como fallback\n');

    console.log('💡 Próximos pasos:');
    console.log('1. Configurar OLLAMA_ENABLED=true en .env');
    console.log('2. Reiniciar el bot: npm run dev');
    console.log('3. El bot usará Ollama cuando Groq falle\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📝 Verifica:');
    console.error('- Ollama está instalado');
    console.error('- Ollama está corriendo (ollama serve)');
    console.error('- Puerto 11434 está disponible\n');
  }
}

testOllama();

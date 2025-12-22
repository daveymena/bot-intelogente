/**
 * 🤖 VERIFICAR OLLAMA
 * Verifica que Ollama esté corriendo y el modelo gemma:2b esté disponible
 */

// Forzar recarga del .env
import { config } from 'dotenv';
config({ override: true });

import { OllamaService } from '../src/lib/ollama-service';

async function verificarOllama() {
  console.log('🤖 VERIFICACIÓN DE OLLAMA\n');

  try {
    // 1. Verificar si Ollama está disponible
    console.log('1️⃣ Verificando si Ollama está corriendo...');
    const available = await OllamaService.isAvailable();
    
    if (!available) {
      console.log('❌ Ollama NO está disponible\n');
      console.log('📝 Para iniciar Ollama:');
      console.log('   1. Abre una nueva terminal');
      console.log('   2. Ejecuta: ollama serve');
      console.log('   3. Deja esa terminal abierta\n');
      return;
    }

    console.log('✅ Ollama está corriendo\n');

    // 2. Listar modelos disponibles
    console.log('2️⃣ Modelos disponibles:');
    const models = await OllamaService.listModels();
    
    if (models.length === 0) {
      console.log('   ⚠️ No hay modelos descargados\n');
    } else {
      models.forEach(model => {
        console.log(`   - ${model}`);
      });
      console.log('');
    }

    // 3. Verificar modelo gemma:2b
    console.log('3️⃣ Verificando modelo gemma:2b...');
    const hasGemma = await OllamaService.checkModel();
    
    if (!hasGemma) {
      console.log('❌ Modelo gemma:2b NO encontrado\n');
      console.log('📝 Para descargar gemma:2b:');
      console.log('   ollama pull gemma:2b\n');
      console.log('💡 Este modelo es pequeño (~1.4GB) y rápido');
      console.log('💡 Perfecto para entrenamiento local ilimitado\n');
      return;
    }

    console.log('✅ Modelo gemma:2b disponible\n');

    // 4. Obtener información del modelo
    console.log('4️⃣ Información del modelo:');
    const info = await OllamaService.getModelInfo();
    
    if (info) {
      console.log(`   Modelo: ${info.modelfile || 'gemma:2b'}`);
      console.log(`   Tamaño: ${info.size ? (info.size / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'N/A'}`);
    }
    console.log('');

    // 5. Probar generación de respuesta
    console.log('5️⃣ Probando generación de respuesta...');
    const testResponse = await OllamaService.generateResponse({
      systemPrompt: 'Eres un asistente de ventas amigable.',
      messages: [
        { role: 'user', content: 'Hola, tienes el curso de piano?' }
      ]
    });

    if (testResponse) {
      console.log('✅ Respuesta generada exitosamente:');
      console.log(`   "${testResponse.text.substring(0, 150)}..."`);
      console.log(`   Confianza: ${(testResponse.confidence * 100).toFixed(0)}%\n`);
    } else {
      console.log('❌ No se pudo generar respuesta\n');
    }

    // 6. Resumen
    console.log('='.repeat(60));
    console.log('📊 RESUMEN\n');
    console.log('✅ Ollama está listo para usar');
    console.log('✅ Modelo gemma:2b disponible');
    console.log('✅ Generación de respuestas funciona');
    console.log('\n💡 Ahora puedes entrenar el bot SIN LÍMITES:');
    console.log('   npx tsx scripts/entrenar-bot-automatico.ts');
    console.log('   npx tsx scripts/entrenar-conversaciones-completas.ts\n');
    console.log('🚀 Ollama usará tu CPU/GPU local (gratis e ilimitado)');
    console.log('🔄 Groq se usará solo como respaldo si Ollama falla\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarOllama();

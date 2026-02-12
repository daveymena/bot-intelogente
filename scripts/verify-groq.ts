
import { GroqAPIRotator } from '../src/lib/groq-api-rotator';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Asegurar que cargamos el .env de la raíz
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGroq() {
  console.log('🚀 Probando conexión con Groq...');
  
  const status = GroqAPIRotator.getStatus();
  console.log(`📡 APIs detectadas: ${status.apis.length}`);
  status.apis.forEach(api => {
    const hiddenKey = api.apiKey.substring(0, 5) + '...' + api.apiKey.substring(api.apiKey.length - 4);
    console.log(`   - ${api.name}: ${hiddenKey}`);
  });

  if (status.apis.length === 0) {
    console.log('❌ Error: No se detectaron APIs en el archivo .env');
    return;
  }

  try {
    const response = await GroqAPIRotator.makeRequest([
      { role: 'user', content: 'Di "Hola, Groq está activo" si puedes leer esto.' }
    ], {
      temperature: 0.7,
      maxTokens: 50
    });

    console.log('\n✅ ¡Éxito! Groq respondió:');
    console.log('----------------------------');
    console.log(response);
    console.log('----------------------------');
  } catch (error: any) {
    console.log('\n❌ Error en la conexión:');
    console.log(error.message);
  }
}

testGroq();

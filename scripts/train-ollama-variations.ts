/**
 * 🎯 SCRIPT DE ENTRENAMIENTO CON OLLAMA
 * 
 * Ejecutar: npm run train:ollama
 */

import { OllamaTrainingSystem } from '../src/lib/ollama-training-system';
import { db } from '../src/lib/db';

async function main() {
  console.log('🎓 Iniciando entrenamiento con Ollama...\n');

  try {
    // Entrenar 20 productos con 5 variaciones cada uno
    await OllamaTrainingSystem.trainBatch({
      maxProducts: 20
    });

    // Mostrar estadísticas
    console.log('\n📊 Estadísticas:');
    
    const totalVariations = await db.conversationPattern.count({
      where: {
        intent: 'product_description'
      }
    });

    console.log(`   Total variaciones en BD: ${totalVariations}`);
    console.log('\n🎉 Entrenamiento completado!');
  } catch (error) {
    console.error('❌ Error durante entrenamiento:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));

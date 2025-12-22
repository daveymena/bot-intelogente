
import { buscarProductos } from '../src/conversational-module/ai/conversacionController';
import { db } from '../src/lib/db';

async function main() {
  console.log('🔍 Debugging buscarProductos...');
  try {
    const userId = 'cmifgbicr0000kmz0yz7tqjb9';
    console.log(`Testing with userId: ${userId}`);
    
    const results = await buscarProductos('curso de piano', userId);
    console.log(`✅ Search OK. Found: ${results.length}`);
    
    // Correctly accessing properties of ProductoInfo
    results.forEach(p => console.log(`- ${p.nombre} (${p.categoria})`));

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error instanceof Error) {
      console.error(error.stack);
    } else {
      console.error(error);
    }
  } finally {
    await db.$disconnect();
  }
}

main();

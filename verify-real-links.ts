
import { SimpleConversationHandler } from './src/lib/simple-conversation-handler';
import { db } from './src/lib/db';

async function verifyRealLinks() {
  console.log('🧪 VERIFICANDO LINKS REALES POR PRODUCTO...\n');

  try {
    const adminId = 'cmixj6v1i0000uo70u6i3zxe1';
    const handler = SimpleConversationHandler.getInstance();
    
    // CASO 1: Producto A (Piano)
    console.log('👉 BUSCANDO PRODUCTO 1: "Curso Piano"');
    const resA = await handler.handleMessage({ 
      chatId: 'test-real-1', userId: adminId, message: 'Busco curso piano' 
    });
    const linkA = resA.text.match(/https:\/\/mp\.com\/[a-zA-Z0-9?=&]+/)?.[0] || 'No Link';
    console.log(`   🔗 Link A: ${linkA}`);

    // CASO 2: Producto B (Mega Pack) - Buscamos algo específico para que sea ÚNICO
    console.log('\n👉 BUSCANDO PRODUCTO 2: "Mega Pack 16" (Específico)');
    const resB = await handler.handleMessage({ 
      chatId: 'test-real-2', userId: adminId, message: 'Busco mega pack 16' 
    });
    const linkB = resB.text.match(/https:\/\/mp\.com\/[a-zA-Z0-9?=&]+/)?.[0] || 'No Link';
    console.log(`   🔗 Link B: ${linkB}`);

    console.log('\n---------------------------------------------------');
    // Validación
    if (linkA !== 'No Link' && linkB !== 'No Link') {
        if (linkA !== linkB) {
            console.log('✅ ÉXITO: Los links son DIFERENTES y ESPECÍFICOS para cada producto.');
        } else {
            console.log('❌ ERROR: Los links son IDÉNTICOS (Deberían ser únicos).');
        }
    } else {
        console.log('❌ ERROR: No se generaron links para alguno de los productos.');
    }
    console.log('---------------------------------------------------');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

verifyRealLinks();

/**
 * Script para probar conversación completa y ver mensajes reales
 */

import { handleMessage } from '../src/clean-bot';

async function testConversacion() {
  console.log('\n🧪 PRUEBA DE CONVERSACIÓN COMPLETA\n');
  
  const userId = '573001234567@s.whatsapp.net';
  const ownerUserId = 'test-user-id';
  
  const conversacion = [
    'Hola',
    'Estoy interesado en el curso de piano',
    'Necesito más información del curso de piano',
    'Cuánto cuesta?',
    'Quiero pagar',
  ];
  
  for (let i = 0; i < conversacion.length; i++) {
    const mensaje = conversacion[i];
    
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`TURNO ${i + 1}/${conversacion.length}`);
    console.log('#'.repeat(80));
    
    try {
      const response = await handleMessage(userId, mensaje, ownerUserId);
      
      // Esperar un poco entre mensajes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  console.log('\n✅ Prueba completada\n');
}

testConversacion().catch(console.error);

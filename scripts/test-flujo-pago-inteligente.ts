/**
 * Script para probar el flujo de pago inteligente
 */

import { handleMessage } from '../src/clean-bot';

async function testFlujo() {
  console.log('\n🧪 PRUEBA DE FLUJO DE PAGO INTELIGENTE\n');
  
  const userId = '573001234567@s.whatsapp.net';
  const ownerUserId = 'test-user-id';
  
  const conversacion = [
    // 1. Establecer contexto con un producto
    {
      mensaje: 'Estoy interesado en el curso de piano',
      descripcion: '1️⃣ Establecer contexto del producto'
    },
    
    // 2. Consultar métodos de pago
    {
      mensaje: 'Qué métodos de pago aceptan?',
      descripcion: '2️⃣ Consultar métodos disponibles'
    },
    
    // 3. Solicitar link de pago genérico
    {
      mensaje: 'Quiero pagar',
      descripcion: '3️⃣ Solicitud genérica de pago'
    },
    
    // 4. Solicitar link específico de MercadoPago
    {
      mensaje: 'Envíame el link de mercado pago',
      descripcion: '4️⃣ Solicitud específica de MercadoPago'
    },
    
    // 5. Cambiar a PayPal
    {
      mensaje: 'Mejor dame el link de paypal',
      descripcion: '5️⃣ Cambiar método a PayPal'
    },
    
    // 6. Confirmar pago
    {
      mensaje: 'Ya pagué',
      descripcion: '6️⃣ Confirmar pago realizado'
    },
  ];
  
  for (let i = 0; i < conversacion.length; i++) {
    const { mensaje, descripcion } = conversacion[i];
    
    console.log(`\n${'#'.repeat(80)}`);
    console.log(`${descripcion}`);
    console.log('#'.repeat(80));
    
    try {
      await handleMessage(userId, mensaje, ownerUserId);
      
      // Esperar un poco entre mensajes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  console.log('\n✅ Prueba completada\n');
}

testFlujo().catch(console.error);

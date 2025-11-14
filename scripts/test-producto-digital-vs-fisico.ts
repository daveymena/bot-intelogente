/**
 * Test: Productos Digitales vs Físicos
 * Verifica que el bot maneje correctamente cada tipo
 */

import { procesarFlujoDigital } from '../src/conversational-module/flows/flujoDigital';
import { procesarFlujoFisico } from '../src/conversational-module/flows/flujoFisico';
import type { ProductoInfo } from '../src/conversational-module/ai/promptBuilder';
import type { ContextoConversacion } from '../src/conversational-module/utils/obtenerContexto';

const productoDigital: ProductoInfo = {
  id: 1,
  nombre: 'Curso Completo de Piano',
  descripcion: 'Aprende piano desde cero con 50 lecciones en video',
  precio: 150000,
  categoria: 'DIGITAL',
  tipoVenta: 'DIGITAL',
  metodosPago: ['MercadoPago', 'PayPal', 'Nequi'],
};

const productoFisico: ProductoInfo = {
  id: 2,
  nombre: 'Laptop HP 15-dy2021la',
  descripcion: 'Intel Core i5, 8GB RAM, 256GB SSD',
  precio: 1800000,
  categoria: 'COMPUTADORES',
  tipoVenta: 'FISICO',
  stock: 5,
  metodosPago: ['MercadoPago', 'PayPal', 'Nequi', 'Efectivo'],
};

const contexto: ContextoConversacion = {
  telefono: '+573001234567',
  historial: [],
  ultimaInteraccion: new Date(),
  historialMensajes: [],
  userId: 'test-user',
};

async function testProductoDigital() {
  console.log('\n🎓 TEST: PRODUCTO DIGITAL');
  console.log('='.repeat(50));
  
  const respuesta = await procesarFlujoDigital(
    'Me interesa el curso de piano',
    productoDigital,
    contexto
  );
  
  console.log('\n📝 Respuesta del bot:');
  console.log(respuesta);
  
  // Verificar que NO mencione recogida o envío
  const errores = [];
  if (/recog(er|ida|elo)/i.test(respuesta)) {
    errores.push('❌ Menciona recogida en tienda');
  }
  if (/env[ií]o.*domicilio/i.test(respuesta)) {
    errores.push('❌ Menciona envío a domicilio');
  }
  if (/consultar.*disponibilidad/i.test(respuesta)) {
    errores.push('❌ Consulta disponibilidad (siempre disponible)');
  }
  
  if (errores.length > 0) {
    console.log('\n⚠️ ERRORES DETECTADOS:');
    errores.forEach(e => console.log(e));
  } else {
    console.log('\n✅ Producto digital manejado correctamente');
  }
}

async function testProductoFisico() {
  console.log('\n\n📦 TEST: PRODUCTO FÍSICO');
  console.log('='.repeat(50));
  
  const respuesta = await procesarFlujoFisico(
    'Me interesa la laptop HP',
    productoFisico,
    contexto
  );
  
  console.log('\n📝 Respuesta del bot:');
  console.log(respuesta);
  
  // Verificar que SÍ mencione opciones de entrega
  const verificaciones = [];
  if (/recog(er|ida|elo)/i.test(respuesta)) {
    verificaciones.push('✅ Menciona recogida en tienda');
  } else {
    verificaciones.push('❌ NO menciona recogida en tienda');
  }
  
  if (/env[ií]o/i.test(respuesta)) {
    verificaciones.push('✅ Menciona envío a domicilio');
  } else {
    verificaciones.push('❌ NO menciona envío a domicilio');
  }
  
  if (/disponible/i.test(respuesta)) {
    verificaciones.push('✅ Indica disponibilidad');
  } else {
    verificaciones.push('❌ NO indica disponibilidad');
  }
  
  console.log('\n📊 Verificaciones:');
  verificaciones.forEach(v => console.log(v));
}

async function main() {
  console.log('🧪 TEST: PRODUCTOS DIGITALES VS FÍSICOS');
  console.log('Verificando que el bot maneje correctamente cada tipo\n');
  
  await testProductoDigital();
  await testProductoFisico();
  
  console.log('\n\n✅ Tests completados');
}

main().catch(console.error);

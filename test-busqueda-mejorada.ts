/**
 * Script de prueba para verificar que la búsqueda mejorada funciona
 */

import { buscarProductos } from './src/conversational-module/ai/conversacionController';

async function testBusquedaMejorada() {
  console.log('🧪 PRUEBA DE BÚSQUEDA MEJORADA');
  console.log('================================');

  const consultas = [
    'portátil',
    'portatil',
    'laptop',
    'computador',
    'parlante',
    'telefono',
    'celular'
  ];

  for (const consulta of consultas) {
    console.log(`\n🔍 Buscando: "${consulta}"`);
    console.log('------------------------------');

    try {
      const resultados = await buscarProductos(consulta);

      console.log(`✅ Encontrados: ${resultados.length} productos`);

      resultados.slice(0, 3).forEach((producto, i) => {
        console.log(`${i + 1}. ${producto.nombre} - ${producto.categoria} (${producto.tipoVenta})`);
      });

      if (resultados.length === 0) {
        console.log('⚠️  No se encontraron productos');
      }

    } catch (error) {
      console.error(`❌ Error buscando "${consulta}":`, error);
    }
  }

  console.log('\n🎉 Prueba completada');
}

// Ejecutar la prueba
testBusquedaMejorada().catch(console.error);
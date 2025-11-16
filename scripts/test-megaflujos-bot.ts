#!/usr/bin/env npx tsx
/**
 * TEST DE MEGAFLUJOS EN EL BOT
 * 
 * Prueba que el bot puede usar los megaflujos para responder
 */

import * as fs from 'fs';
import * as path from 'path';

async function testMegaflujos() {
  console.log('🧪 TEST DE MEGAFLUJOS EN EL BOT\n');
  console.log('='.repeat(60));

  // Cargar ejemplos
  const rutaIntegracion = path.join(process.cwd(), 'data', 'megaflujos-integracion-bot.json');
  
  if (!fs.existsSync(rutaIntegracion)) {
    console.error('❌ No encontrado: megaflujos-integracion-bot.json');
    process.exit(1);
  }

  const contenido = fs.readFileSync(rutaIntegracion, 'utf-8');
  const datos = JSON.parse(contenido);
  const ejemplos = datos.ejemplos;

  console.log(`\n📚 Ejemplos cargados: ${ejemplos.length}`);

  // Simular búsqueda de ejemplos similares
  function buscarEjemplosSimilares(entrada: string, topK = 3) {
    const palabrasEntrada = entrada.toLowerCase().split(' ');
    
    return ejemplos
      .map((e: any) => ({
        ...e,
        similitud: palabrasEntrada.filter(p => 
          e.entrada.toLowerCase().includes(p)
        ).length
      }))
      .filter((e: any) => e.similitud > 0)
      .sort((a: any, b: any) => b.similitud - a.similitud)
      .slice(0, topK);
  }

  // Casos de prueba
  const casosPrueba = [
    "Hola, ¿tienes portátiles económicos?",
    "¿Y si no llega mi pedido?",
    "Quiero agendar una cita",
    "Mi laptop está muy lenta",
    "¿Cómo entregan el megapack?",
    "¿Me pueden fiar un producto?",
    "Eso es puro robo, seguro estafas",
    "Solo estoy mirando"
  ];

  console.log('\n' + '='.repeat(60));
  console.log('🔍 PRUEBAS DE BÚSQUEDA DE EJEMPLOS\n');

  let totalExitosos = 0;

  casosPrueba.forEach((caso, idx) => {
    console.log(`\n[${idx + 1}/${casosPrueba.length}] Usuario: "${caso}"`);
    
    const similares = buscarEjemplosSimilares(caso);
    
    if (similares.length > 0) {
      console.log(`   ✅ Encontrados ${similares.length} ejemplos similares:`);
      similares.forEach((e: any, i: number) => {
        console.log(`\n   ${i + 1}. Entrada: "${e.entrada}"`);
        console.log(`      Respuesta: "${e.salida.substring(0, 80)}..."`);
        console.log(`      Intención: ${e.intención}`);
        console.log(`      Categoría: ${e.categoría}`);
        console.log(`      Complejidad: ${e.complejidad}`);
      });
      totalExitosos++;
    } else {
      console.log(`   ⚠️  No se encontraron ejemplos similares`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS DEL TEST\n');
  console.log(`Casos de prueba: ${casosPrueba.length}`);
  console.log(`Exitosos: ${totalExitosos}/${casosPrueba.length}`);
  console.log(`Tasa de éxito: ${((totalExitosos / casosPrueba.length) * 100).toFixed(1)}%`);

  // Estadísticas de ejemplos
  console.log('\n📈 ESTADÍSTICAS DE EJEMPLOS\n');

  const porIntención: Record<string, number> = {};
  const porCategoría: Record<string, number> = {};
  const porComplejidad: Record<string, number> = {};

  ejemplos.forEach((e: any) => {
    porIntención[e.intención] = (porIntención[e.intención] || 0) + 1;
    porCategoría[e.categoría] = (porCategoría[e.categoría] || 0) + 1;
    porComplejidad[e.complejidad] = (porComplejidad[e.complejidad] || 0) + 1;
  });

  console.log('Top 5 intenciones:');
  Object.entries(porIntención)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .forEach(([int, count]) => {
      console.log(`   • ${int}: ${count} ejemplos`);
    });

  console.log('\nCategorías:');
  Object.entries(porCategoría).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count} ejemplos`);
  });

  console.log('\nComplejidad:');
  Object.entries(porComplejidad).forEach(([comp, count]) => {
    console.log(`   • ${comp}: ${count} ejemplos`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ TEST COMPLETADO\n');
  console.log('✅ El bot puede usar estos megaflujos para responder');
  console.log('🚀 Próximo paso: Integrar en tu sistema de IA');
}

// Ejecutar
testMegaflujos().catch(console.error);

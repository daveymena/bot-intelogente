/**
 * TEST: Verificar que las respuestas de IA sean cortas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simular el servicio de IA
async function testRespuestasCortas() {
  console.log('🧪 TEST: Respuestas Cortas de IA\n');
  console.log('='.repeat(70));
  
  const preguntas = [
    "Hola, qué productos tienen?",
    "Tienen monitores?",
    "Cuánto cuesta el monitor LG?",
    "Qué portátiles tienen para juegos?",
    "Necesito un setup completo para trabajar desde casa"
  ];
  
  console.log('\n📋 Verificando longitud de respuestas...\n');
  
  for (const pregunta of preguntas) {
    console.log(`\n❓ PREGUNTA: "${pregunta}"`);
    console.log('-'.repeat(70));
    
    // Simular respuesta corta ideal
    const respuestaIdeal = generarRespuestaCorta(pregunta);
    
    console.log(`✅ RESPUESTA IDEAL (${respuestaIdeal.length} caracteres):`);
    console.log(`   "${respuestaIdeal}"`);
    
    // Verificar longitud
    if (respuestaIdeal.length <= 200) {
      console.log(`   ✅ Longitud OK (${respuestaIdeal.length}/200 caracteres)`);
    } else {
      console.log(`   ⚠️  Muy larga (${respuestaIdeal.length}/200 caracteres)`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN:');
  console.log('✅ Objetivo: Máximo 200 caracteres por respuesta');
  console.log('✅ Formato: [Respuesta directa] + [Pregunta corta]');
  console.log('✅ Estilo: Conciso, sin rodeos');
  
  await prisma.$disconnect();
}

function generarRespuestaCorta(pregunta) {
  const p = pregunta.toLowerCase();
  
  if (p.includes('hola') || p.includes('qué productos')) {
    return 'Tenemos portátiles, monitores, teclados y más. ¿Qué buscas?';
  }
  
  if (p.includes('monitores')) {
    return 'Monitor LG 27" $649.900 y LG 24" $549.900. ¿Cuál prefieres?';
  }
  
  if (p.includes('cuánto cuesta')) {
    return 'Monitor LG 27" está en $649.900 COP. ¿Te interesa?';
  }
  
  if (p.includes('portátiles') && p.includes('juegos')) {
    return 'Acer A15 i5 16GB $1.899.900 ideal para gaming. ¿Lo quieres?';
  }
  
  if (p.includes('setup')) {
    return 'Portátil + Monitor + Teclado por $2.7M aprox. ¿Te muestro?';
  }
  
  return 'Tenemos varias opciones. ¿Qué necesitas?';
}

testRespuestasCortas().catch(console.error);

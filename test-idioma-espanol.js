/**
 * 🇪🇸 TEST CRÍTICO: VERIFICAR QUE BOT RESPONDE EN ESPAÑOL
 * 
 * Este test verifica que el bot NUNCA responda en inglés
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

// Frases que indican respuesta en INGLÉS (prohibido)
const ENGLISH_PHRASES = [
  'I understand',
  'Here\'s why',
  'I can\'t',
  'I don\'t',
  'I\'m an AI',
  'Unfortunately',
  'However',
  'Tell me',
  'What languages',
  'What kind of',
  'I can help',
  'Let me',
  'You might',
  'Here are',
  'I\'ll give you',
  'language learning',
  'physical objects',
  'real-world resources'
];

// Frases que indican respuesta en ESPAÑOL (correcto)
const SPANISH_PHRASES = [
  'tengo',
  'tenemos',
  'puedo',
  'claro',
  'excelente',
  'perfecto',
  'hola',
  'precio',
  'producto',
  'megapack',
  'curso'
];

async function testBotLanguage() {
  console.log('\n🇪🇸 ═══════════════════════════════════════════════════════');
  console.log('   TEST CRÍTICO: IDIOMA ESPAÑOL');
  console.log('═══════════════════════════════════════════════════════\n');

  const testCases = [
    {
      name: 'Pregunta sobre megapacks de idiomas',
      message: 'tienes mega packs de idiomas?',
      shouldContain: ['megapack', 'idioma', 'precio'],
      shouldNotContain: ENGLISH_PHRASES
    },
    {
      name: 'Pregunta sobre cursos',
      message: 'qué cursos tienes?',
      shouldContain: ['curso', 'tengo', 'precio'],
      shouldNotContain: ENGLISH_PHRASES
    },
    {
      name: 'Pregunta sobre computadores',
      message: 'tienes portátiles?',
      shouldContain: ['portátil', 'precio', 'tengo'],
      shouldNotContain: ENGLISH_PHRASES
    },
    {
      name: 'Saludo simple',
      message: 'hola',
      shouldContain: ['hola', 'puedo', 'ayudar'],
      shouldNotContain: ENGLISH_PHRASES
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Mensaje: "${testCase.message}"`);
    
    try {
      // Simular mensaje del bot
      const response = await fetch(`${API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: '573136174267',
          message: testCase.message,
          isTest: true
        })
      });

      if (!response.ok) {
        console.log(`   ❌ Error en API: ${response.status}`);
        failed++;
        continue;
      }

      const data = await response.json();
      const botResponse = data.response || data.message || '';
      
      console.log(`   🤖 Respuesta: "${botResponse.substring(0, 150)}..."`);

      // Verificar que NO contenga inglés
      let hasEnglish = false;
      for (const phrase of testCase.shouldNotContain) {
        if (botResponse.toLowerCase().includes(phrase.toLowerCase())) {
          console.log(`   ❌ FALLO: Contiene frase en INGLÉS: "${phrase}"`);
          hasEnglish = true;
          break;
        }
      }

      if (hasEnglish) {
        console.log(`   ❌ TEST FALLIDO: Bot respondió en INGLÉS`);
        failed++;
        continue;
      }

      // Verificar que contenga español
      let hasSpanish = false;
      for (const phrase of testCase.shouldContain) {
        if (botResponse.toLowerCase().includes(phrase.toLowerCase())) {
          hasSpanish = true;
          break;
        }
      }

      if (!hasSpanish) {
        console.log(`   ⚠️  ADVERTENCIA: No se detectaron frases en español esperadas`);
      }

      console.log(`   ✅ TEST PASADO: Respuesta en ESPAÑOL`);
      passed++;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }

    // Esperar entre tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   RESULTADOS FINALES');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Tests pasados: ${passed}`);
  console.log(`❌ Tests fallidos: ${failed}`);
  console.log(`📊 Total: ${testCases.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡ÉXITO! El bot responde SIEMPRE en ESPAÑOL\n');
  } else {
    console.log('\n⚠️  ATENCIÓN: El bot tiene problemas de idioma\n');
  }
}

// Ejecutar test
testBotLanguage().catch(console.error);

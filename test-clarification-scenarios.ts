/**
 * 🧪 TESTS DE ESCENARIOS DE CLARIFICACIÓN
 * 
 * Valida cómo el sistema debería manejar preguntas de clarificación
 */

import dotenv from 'dotenv';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

interface ClarificationScenario {
  name: string;
  initialMessage: string;
  ambiguityReason: string;
  suggestedQuestion: string;
  possibleAnswers: {
    answer: string;
    expectedResult: string;
  }[];
}

const scenarios: ClarificationScenario[] = [
  {
    name: 'Ambigüedad: teclado',
    initialMessage: 'busco un teclado',
    ambiguityReason: 'Puede ser teclado de computadora o teclado musical',
    suggestedQuestion: '¿Buscas un teclado para escribir en la computadora o un teclado musical para tocar?',
    possibleAnswers: [
      {
        answer: 'para escribir',
        expectedResult: 'Mostrar teclados de computadora (periféricos)',
      },
      {
        answer: 'para tocar música',
        expectedResult: 'Mostrar teclados musicales o cursos de piano',
      },
      {
        answer: 'el musical',
        expectedResult: 'Mostrar teclados musicales o cursos de piano',
      },
    ],
  },
  {
    name: 'Ambigüedad: algo para trabajar',
    initialMessage: 'necesito algo para trabajar',
    ambiguityReason: 'Muy vago, puede ser laptop, software, curso, etc.',
    suggestedQuestion: '¿Qué tipo de herramienta necesitas? ¿Una laptop, un curso para aprender algo, o software?',
    possibleAnswers: [
      {
        answer: 'una laptop',
        expectedResult: 'Mostrar laptops disponibles',
      },
      {
        answer: 'un curso',
        expectedResult: 'Preguntar: ¿Curso de qué tema?',
      },
      {
        answer: 'para diseño gráfico',
        expectedResult: 'Mostrar laptops potentes o cursos de diseño',
      },
    ],
  },
  {
    name: 'Ambigüedad: regalo tecnológico',
    initialMessage: 'quiero un regalo tecnológico',
    ambiguityReason: 'Puede ser cualquier producto tecnológico',
    suggestedQuestion: '¿Para quién es el regalo? ¿Qué le gusta hacer? (estudiar, trabajar, jugar, etc.)',
    possibleAnswers: [
      {
        answer: 'para mi hijo que estudia',
        expectedResult: 'Mostrar laptops para estudiantes o cursos educativos',
      },
      {
        answer: 'para alguien que le gusta la música',
        expectedResult: 'Mostrar cursos de música o instrumentos',
      },
      {
        answer: 'algo económico',
        expectedResult: 'Preguntar: ¿Qué tipo de producto? (laptop, curso, accesorio)',
      },
    ],
  },
  {
    name: 'Ambigüedad: curso',
    initialMessage: 'busco un curso',
    ambiguityReason: 'No especifica tema del curso',
    suggestedQuestion: '¿Qué te gustaría aprender? (idiomas, música, tecnología, etc.)',
    possibleAnswers: [
      {
        answer: 'de piano',
        expectedResult: 'Mostrar cursos de piano disponibles',
      },
      {
        answer: 'de inglés',
        expectedResult: 'Mostrar cursos de inglés',
      },
      {
        answer: 'algo completo',
        expectedResult: 'Mostrar megapacks con múltiples cursos',
      },
    ],
  },
  {
    name: 'Presupuesto: laptop barata',
    initialMessage: 'busco una laptop barata',
    ambiguityReason: 'No especifica rango de precio exacto',
    suggestedQuestion: '¿Cuál es tu presupuesto aproximado? (menos de 1 millón, 1-2 millones, etc.)',
    possibleAnswers: [
      {
        answer: 'menos de 1 millón',
        expectedResult: 'Filtrar laptops con precio < 1,000,000',
      },
      {
        answer: 'lo más económico posible',
        expectedResult: 'Mostrar la laptop más barata disponible',
      },
      {
        answer: 'hasta 2 millones',
        expectedResult: 'Filtrar laptops con precio <= 2,000,000',
      },
    ],
  },
];

function simulateClarificationFlow(scenario: ClarificationScenario) {
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}🧪 ESCENARIO: ${scenario.name}${colors.reset}\n`);
  
  console.log(`${colors.cyan}1️⃣ MENSAJE INICIAL:${colors.reset}`);
  console.log(`   Cliente: "${scenario.initialMessage}"\n`);
  
  console.log(`${colors.cyan}2️⃣ ANÁLISIS DE AMBIGÜEDAD:${colors.reset}`);
  console.log(`   Razón: ${scenario.ambiguityReason}\n`);
  
  console.log(`${colors.cyan}3️⃣ PREGUNTA DE CLARIFICACIÓN SUGERIDA:${colors.reset}`);
  console.log(`   Bot: "${scenario.suggestedQuestion}"\n`);
  
  console.log(`${colors.cyan}4️⃣ POSIBLES RESPUESTAS Y RESULTADOS:${colors.reset}`);
  scenario.possibleAnswers.forEach((answer, i) => {
    console.log(`   ${i + 1}. Cliente: "${answer.answer}"`);
    console.log(`      → Resultado esperado: ${answer.expectedResult}`);
  });
  
  console.log('');
}

function testClarificationLimit() {
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}🧪 TEST: Límite de preguntas de clarificación${colors.reset}\n`);
  
  console.log(`${colors.cyan}REGLA: Máximo 2 preguntas de clarificación${colors.reset}\n`);
  
  const conversation = [
    { role: 'user', message: 'busco algo' },
    { role: 'bot', message: '¿Qué tipo de producto buscas?' },
    { role: 'user', message: 'algo tecnológico' },
    { role: 'bot', message: '¿Para qué lo necesitas?' },
    { role: 'user', message: 'para trabajar' },
    { role: 'bot', message: 'Te muestro nuestras laptops y cursos disponibles...' },
  ];
  
  let clarificationCount = 0;
  
  conversation.forEach((msg, i) => {
    if (msg.role === 'bot' && msg.message.includes('?')) {
      clarificationCount++;
    }
    
    const prefix = msg.role === 'user' ? '👤' : '🤖';
    const color = msg.role === 'user' ? colors.blue : colors.green;
    console.log(`   ${prefix} ${color}${msg.message}${colors.reset}`);
  });
  
  console.log('');
  console.log(`   Preguntas de clarificación: ${clarificationCount}`);
  
  if (clarificationCount <= 2) {
    console.log(`   ${colors.green}✅ PASS: Respeta el límite de 2 preguntas${colors.reset}`);
  } else {
    console.log(`   ${colors.red}❌ FAIL: Excede el límite de 2 preguntas${colors.reset}`);
  }
  
  console.log('');
}

function testIgnoredClarification() {
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.yellow}🧪 TEST: Cliente ignora pregunta de clarificación${colors.reset}\n`);
  
  console.log(`${colors.cyan}ESCENARIO:${colors.reset}`);
  console.log(`   1. Bot pregunta: "¿Buscas un teclado para escribir o musical?"`);
  console.log(`   2. Cliente responde con algo diferente: "cuánto cuesta el Mega Pack 11?"\n`);
  
  console.log(`${colors.cyan}COMPORTAMIENTO ESPERADO:${colors.reset}`);
  console.log(`   ${colors.green}✅ El bot debe adaptarse al nuevo contexto${colors.reset}`);
  console.log(`   ${colors.green}✅ No debe repetir la pregunta de clarificación${colors.reset}`);
  console.log(`   ${colors.green}✅ Debe responder sobre el Mega Pack 11${colors.reset}\n`);
  
  console.log(`${colors.cyan}COMPORTAMIENTO INCORRECTO:${colors.reset}`);
  console.log(`   ${colors.red}❌ Insistir en la pregunta anterior${colors.reset}`);
  console.log(`   ${colors.red}❌ Confundirse y no responder${colors.reset}`);
  console.log(`   ${colors.red}❌ Crear un loop de preguntas${colors.reset}\n`);
}

async function runClarificationTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🧪 TESTS DE ESCENARIOS DE CLARIFICACIÓN                 ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Test 1: Escenarios de clarificación
  console.log(`${colors.blue}📋 PARTE 1: Escenarios de clarificación${colors.reset}\n`);
  scenarios.forEach(scenario => {
    simulateClarificationFlow(scenario);
  });

  // Test 2: Límite de preguntas
  console.log(`${colors.blue}📋 PARTE 2: Límite de preguntas${colors.reset}\n`);
  testClarificationLimit();

  // Test 3: Cliente ignora clarificación
  console.log(`${colors.blue}📋 PARTE 3: Cliente ignora clarificación${colors.reset}\n`);
  testIgnoredClarification();

  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  ✅ TESTS COMPLETADOS                                     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.yellow}💡 CONCLUSIÓN:${colors.reset}`);
  console.log(`   El sistema actual NO implementa preguntas de clarificación.`);
  console.log(`   Estos tests muestran cómo DEBERÍA funcionar el nuevo sistema.\n`);
}

// Ejecutar tests
runClarificationTests().catch(console.error);

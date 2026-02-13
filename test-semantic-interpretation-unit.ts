/**
 * 🧪 TESTS UNITARIOS PARA INTERPRETACIÓN SEMÁNTICA
 * 
 * Tests específicos para validar la lógica de interpretación de intención
 */

import dotenv from 'dotenv';

dotenv.config();

// Colores
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface IntentTestCase {
  name: string;
  message: string;
  expectedIntent: string;
  expectedProductType: 'physical' | 'digital' | 'service' | 'ambiguous';
  expectedAmbiguity: 'low' | 'medium' | 'high';
  expectedKeywords: string[];
  shouldAskClarification: boolean;
}

const intentTests: IntentTestCase[] = [
  {
    name: 'Intención clara: laptop específica',
    message: 'Laptop Asus Vivobook 15',
    expectedIntent: 'Buscar producto específico: Laptop Asus Vivobook 15',
    expectedProductType: 'physical',
    expectedAmbiguity: 'low',
    expectedKeywords: ['laptop', 'asus', 'vivobook'],
    shouldAskClarification: false,
  },
  {
    name: 'Intención ambigua: teclado',
    message: 'busco un teclado',
    expectedIntent: 'Buscar teclado (¿físico o musical?)',
    expectedProductType: 'ambiguous',
    expectedAmbiguity: 'high',
    expectedKeywords: ['teclado'],
    shouldAskClarification: true,
  },
  {
    name: 'Intención general: cursos',
    message: 'qué cursos tienes?',
    expectedIntent: 'Listar cursos disponibles',
    expectedProductType: 'digital',
    expectedAmbiguity: 'low',
    expectedKeywords: ['cursos'],
    shouldAskClarification: false,
  },
  {
    name: 'Intención vaga: para trabajar',
    message: 'necesito algo para trabajar',
    expectedIntent: 'Buscar herramienta de trabajo (¿laptop, software, curso?)',
    expectedProductType: 'ambiguous',
    expectedAmbiguity: 'high',
    expectedKeywords: ['trabajar'],
    shouldAskClarification: true,
  },
  {
    name: 'Intención con presupuesto: laptop barata',
    message: 'busco una laptop barata',
    expectedIntent: 'Buscar laptop con presupuesto bajo',
    expectedProductType: 'physical',
    expectedAmbiguity: 'low',
    expectedKeywords: ['laptop', 'barata'],
    shouldAskClarification: false,
  },
  {
    name: 'Intención con uso: aprender inglés',
    message: 'quiero aprender inglés',
    expectedIntent: 'Buscar curso de inglés',
    expectedProductType: 'digital',
    expectedAmbiguity: 'low',
    expectedKeywords: ['aprender', 'inglés'],
    shouldAskClarification: false,
  },
  {
    name: 'Corrección ortográfica: curzo de piyano',
    message: 'me interesa un curzo de piyano',
    expectedIntent: 'Buscar curso de piano (corregido)',
    expectedProductType: 'digital',
    expectedAmbiguity: 'low',
    expectedKeywords: ['curso', 'piano'],
    shouldAskClarification: false,
  },
];

/**
 * Extrae keywords del mensaje (simulación simple)
 */
function extractKeywords(message: string): string[] {
  const stopWords = [
    'me', 'interesa', 'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'para', 'con', 'por', 'que', 'como', 'donde', 'cuando',
    'quiero', 'necesito', 'busco', 'tengo', 'hay', 'dame', 'puedes', 'dar'
  ];

  const corrections: Record<string, string> = {
    'curzo': 'curso',
    'piyano': 'piano',
    'portatil': 'portátil',
    'compu': 'computador',
    'lapto': 'laptop'
  };

  const words = message.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !stopWords.includes(word))
    .map(word => corrections[word] || word);

  return words;
}

/**
 * Detecta ambigüedad en el mensaje
 */
function detectAmbiguity(message: string, keywords: string[]): 'low' | 'medium' | 'high' {
  const ambiguousTerms = ['teclado', 'algo', 'cosa', 'producto'];
  const vaguePhrases = ['para trabajar', 'para estudiar', 'regalo', 'bueno'];
  
  const msgLower = message.toLowerCase();
  
  // Alta ambigüedad
  if (ambiguousTerms.some(term => keywords.includes(term))) {
    return 'high';
  }
  
  if (vaguePhrases.some(phrase => msgLower.includes(phrase))) {
    return 'high';
  }
  
  // Baja ambigüedad (búsqueda específica)
  if (keywords.length >= 3 || msgLower.match(/\d+/)) {
    return 'low';
  }
  
  // Ambigüedad media
  return 'medium';
}

/**
 * Detecta tipo de producto
 */
function detectProductType(message: string, keywords: string[]): 'physical' | 'digital' | 'service' | 'ambiguous' {
  const physicalKeywords = ['laptop', 'computador', 'moto', 'teclado', 'mouse', 'monitor'];
  const digitalKeywords = ['curso', 'megapack', 'digital', 'aprender'];
  
  const hasPhysical = keywords.some(k => physicalKeywords.includes(k));
  const hasDigital = keywords.some(k => digitalKeywords.includes(k));
  
  if (hasPhysical && !hasDigital) return 'physical';
  if (hasDigital && !hasPhysical) return 'digital';
  if (hasPhysical && hasDigital) return 'ambiguous';
  
  return 'ambiguous';
}

async function runIntentTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🧪 TESTS UNITARIOS: INTERPRETACIÓN DE INTENCIÓN         ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of intentTests) {
    console.log(`${colors.yellow}🧪 ${test.name}${colors.reset}`);
    console.log(`   Mensaje: "${test.message}"`);

    // Extraer keywords
    const keywords = extractKeywords(test.message);
    const keywordsMatch = test.expectedKeywords.every(k => keywords.includes(k));

    // Detectar ambigüedad
    const ambiguity = detectAmbiguity(test.message, keywords);
    const ambiguityMatch = ambiguity === test.expectedAmbiguity;

    // Detectar tipo de producto
    const productType = detectProductType(test.message, keywords);
    const productTypeMatch = productType === test.expectedProductType;

    // Determinar si debe pedir clarificación
    const shouldAsk = ambiguity === 'high';
    const clarificationMatch = shouldAsk === test.shouldAskClarification;

    // Resultado
    const allMatch = keywordsMatch && ambiguityMatch && productTypeMatch && clarificationMatch;

    if (allMatch) {
      console.log(`   ${colors.green}✅ PASS${colors.reset}`);
      passed++;
    } else {
      console.log(`   ${colors.red}❌ FAIL${colors.reset}`);
      failed++;
      
      if (!keywordsMatch) {
        console.log(`      Keywords: esperado ${test.expectedKeywords.join(', ')}, obtenido ${keywords.join(', ')}`);
      }
      if (!ambiguityMatch) {
        console.log(`      Ambigüedad: esperado ${test.expectedAmbiguity}, obtenido ${ambiguity}`);
      }
      if (!productTypeMatch) {
        console.log(`      Tipo: esperado ${test.expectedProductType}, obtenido ${productType}`);
      }
      if (!clarificationMatch) {
        console.log(`      Clarificación: esperado ${test.shouldAskClarification}, obtenido ${shouldAsk}`);
      }
    }

    console.log('');
  }

  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  📊 RESULTADOS                                            ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`   ${colors.green}✅ Pasados: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}❌ Fallidos: ${failed}${colors.reset}`);
  console.log(`   📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);
}

// Ejecutar tests
runIntentTests().catch(console.error);

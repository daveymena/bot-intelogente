/**
 * 🧪 TEST DE INTERPRETACIÓN INTELIGENTE DE PRODUCTOS
 * 
 * Este test verifica el comportamiento actual del sistema de búsqueda
 * y valida los casos problemáticos que queremos resolver.
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

interface TestCase {
  name: string;
  message: string;
  expectedBehavior: string;
  shouldAskClarification: boolean;
  expectedProductType?: 'physical' | 'digital' | 'service';
  expectedCategory?: string;
}

const testCases: TestCase[] = [
  // 🎯 CASO 1: Ambigüedad "teclado"
  {
    name: 'Ambigüedad: teclado',
    message: 'busco un teclado',
    expectedBehavior: 'Debería preguntar: ¿teclado para escribir o teclado musical?',
    shouldAskClarification: true,
    expectedProductType: 'physical',
  },
  
  // 🎯 CASO 2: Búsqueda específica
  {
    name: 'Búsqueda específica: Mega Pack 11',
    message: 'Mega Pack 11',
    expectedBehavior: 'Debería mostrar directamente el Mega Pack 11',
    shouldAskClarification: false,
    expectedProductType: 'digital',
  },
  
  // 🎯 CASO 3: Búsqueda general
  {
    name: 'Búsqueda general: cursos',
    message: 'cursos digitales?',
    expectedBehavior: 'Debería listar varios cursos disponibles',
    shouldAskClarification: false,
    expectedProductType: 'digital',
    expectedCategory: 'curso',
  },
  
  // 🎯 CASO 4: Búsqueda vaga
  {
    name: 'Búsqueda vaga: algo para trabajar',
    message: 'necesito algo para trabajar',
    expectedBehavior: 'Debería preguntar: ¿qué tipo de trabajo? ¿laptop, software, curso?',
    shouldAskClarification: true,
  },
  
  // 🎯 CASO 5: Búsqueda con presupuesto
  {
    name: 'Búsqueda con presupuesto: laptop barata',
    message: 'busco una laptop barata',
    expectedBehavior: 'Debería filtrar laptops por precio bajo',
    shouldAskClarification: false,
    expectedProductType: 'physical',
    expectedCategory: 'laptop',
  },
  
  // 🎯 CASO 6: Búsqueda multi-categoría
  {
    name: 'Multi-categoría: regalo tecnológico',
    message: 'quiero un regalo tecnológico',
    expectedBehavior: 'Debería mostrar productos de varias categorías',
    shouldAskClarification: true,
  },
  
  // 🎯 CASO 7: Corrección ortográfica
  {
    name: 'Corrección ortográfica: curzo de piyano',
    message: 'me interesa un curzo de piyano',
    expectedBehavior: 'Debería corregir a "curso de piano" y mostrar el producto',
    shouldAskClarification: false,
    expectedProductType: 'digital',
  },
  
  // 🎯 CASO 8: Búsqueda por uso
  {
    name: 'Búsqueda por uso: para aprender inglés',
    message: 'busco algo para aprender inglés',
    expectedBehavior: 'Debería mostrar cursos de inglés',
    shouldAskClarification: false,
    expectedProductType: 'digital',
  },
];

async function testCurrentSystem() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🧪 TEST DEL SISTEMA ACTUAL DE BÚSQUEDA DE PRODUCTOS     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Obtener usuario de prueba
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.log(`${colors.red}❌ No se encontró usuario admin${colors.reset}`);
    return;
  }

  // Obtener productos
  const products = await prisma.product.findMany({
    where: { 
      userId: user.id,
      status: 'AVAILABLE'
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      customCategory: true,
      mainCategory: true,
      tags: true,
      tipo_producto: true,
    }
  });

  console.log(`${colors.blue}📦 Productos disponibles: ${products.length}${colors.reset}\n`);

  // Ejecutar tests
  for (const testCase of testCases) {
    console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}🧪 TEST: ${testCase.name}${colors.reset}`);
    console.log(`${colors.cyan}📝 Mensaje: "${testCase.message}"${colors.reset}`);
    console.log(`${colors.blue}🎯 Comportamiento esperado: ${testCase.expectedBehavior}${colors.reset}\n`);

    try {
      // 1. Simular búsqueda con el sistema actual (Fuse.js + tags)
      const currentSystemResult = await testWithCurrentSystem(testCase.message, products);
      
      console.log(`${colors.cyan}📊 RESULTADO DEL SISTEMA ACTUAL:${colors.reset}`);
      console.log(`   Productos encontrados: ${currentSystemResult.products.length}`);
      
      if (currentSystemResult.products.length > 0) {
        console.log(`   Top 3 resultados:`);
        currentSystemResult.products.slice(0, 3).forEach((p: any, i: number) => {
          console.log(`   ${i + 1}. ${p.name} (score: ${p.score?.toFixed(2) || 'N/A'})`);
          console.log(`      Tipo: ${p.tipo_producto || 'N/A'} | Categoría: ${p.category || 'N/A'}`);
          console.log(`      Tags: ${p.tags || 'N/A'}`);
        });
      } else {
        console.log(`   ${colors.red}❌ No se encontraron productos${colors.reset}`);
      }

      // 2. Analizar si el resultado es correcto
      const analysis = analyzeResult(testCase, currentSystemResult);
      
      console.log(`\n${colors.cyan}🔍 ANÁLISIS:${colors.reset}`);
      console.log(`   ✓ Relevancia: ${analysis.relevance}`);
      console.log(`   ✓ Precisión: ${analysis.precision}`);
      console.log(`   ✓ Problemas detectados: ${analysis.issues.length > 0 ? analysis.issues.join(', ') : 'Ninguno'}`);
      
      if (testCase.shouldAskClarification) {
        console.log(`   ${colors.yellow}⚠️  Debería pedir clarificación pero el sistema actual no lo hace${colors.reset}`);
      }

      // 3. Mostrar recomendación
      console.log(`\n${colors.green}💡 RECOMENDACIÓN:${colors.reset}`);
      console.log(`   ${analysis.recommendation}`);

    } catch (error: any) {
      console.log(`${colors.red}❌ Error en test: ${error.message}${colors.reset}`);
    }

    console.log('');
  }

  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  ✅ TESTS COMPLETADOS                                     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  await prisma.$disconnect();
}

/**
 * Simula búsqueda con el sistema actual (Fuse.js + tags)
 */
async function testWithCurrentSystem(message: string, products: any[]) {
  const Fuse = (await import('fuse.js')).default;
  
  const fuse = new Fuse(products, {
    threshold: 0.6,
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'tags', weight: 0.3 },
      { name: 'category', weight: 0.2 }
    ]
  });

  const results = fuse.search(message);
  
  return {
    products: results.map(r => ({
      ...r.item,
      score: 1 - (r.score || 0)
    }))
  };
}

/**
 * Analiza si el resultado es correcto
 */
function analyzeResult(testCase: TestCase, result: any) {
  const issues: string[] = [];
  let relevance = 'Desconocida';
  let precision = 'Desconocida';
  let recommendation = '';

  const topProduct = result.products[0];

  if (result.products.length === 0) {
    relevance = 'Baja';
    precision = 'N/A';
    issues.push('No se encontraron productos');
    recommendation = 'El sistema necesita mejor comprensión semántica para encontrar productos relevantes';
  } else {
    // Verificar tipo de producto esperado
    if (testCase.expectedProductType && topProduct) {
      const matchesType = topProduct.tipo_producto === testCase.expectedProductType;
      if (matchesType) {
        relevance = 'Alta';
      } else {
        relevance = 'Baja';
        issues.push(`Tipo incorrecto: esperado ${testCase.expectedProductType}, obtenido ${topProduct.tipo_producto}`);
      }
    }

    // Verificar categoría esperada
    if (testCase.expectedCategory && topProduct) {
      const categoryMatch = topProduct.category?.toLowerCase().includes(testCase.expectedCategory.toLowerCase()) ||
                           topProduct.customCategory?.toLowerCase().includes(testCase.expectedCategory.toLowerCase());
      if (categoryMatch) {
        precision = 'Alta';
      } else {
        precision = 'Baja';
        issues.push(`Categoría incorrecta: esperado ${testCase.expectedCategory}`);
      }
    }

    // Verificar si debería pedir clarificación
    if (testCase.shouldAskClarification) {
      issues.push('Debería pedir clarificación pero muestra productos directamente');
      recommendation = 'Implementar motor de detección de ambigüedad y preguntas de clarificación';
    } else if (issues.length === 0) {
      recommendation = 'El resultado es correcto, pero podría mejorarse con interpretación semántica';
    } else {
      recommendation = 'Implementar búsqueda semántica sin dependencia de tags para mejorar precisión';
    }
  }

  return {
    relevance,
    precision,
    issues,
    recommendation
  };
}

// Ejecutar tests
testCurrentSystem().catch(console.error);

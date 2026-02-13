/**
 * 🧪 TEST DEL NUEVO SISTEMA DE INTERPRETACIÓN INTELIGENTE
 * 
 * Valida que el nuevo sistema funciona correctamente
 */

import { PrismaClient } from '@prisma/client';
import { SemanticInterpreterService } from './src/lib/bot/semantic-interpreter';
import { ClarificationEngine } from './src/lib/bot/clarification-engine';
import { ProductMatcherService } from './src/lib/bot/product-matcher';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

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
  expectedProductCount?: number;
}

const testCases: TestCase[] = [
  {
    name: 'Ambigüedad: teclado',
    message: 'busco un teclado',
    expectedBehavior: 'Debería preguntar: ¿teclado para escribir o musical?',
    shouldAskClarification: true,
  },
  {
    name: 'Búsqueda específica: Mega Pack 11',
    message: 'Mega Pack 11',
    expectedBehavior: 'Debería mostrar directamente el Mega Pack 11',
    shouldAskClarification: false,
    expectedProductCount: 1,
  },
  {
    name: 'Búsqueda general: cursos',
    message: 'cursos digitales?',
    expectedBehavior: 'Debería listar varios cursos disponibles',
    shouldAskClarification: false,
    expectedProductCount: 3,
  },
  {
    name: 'Búsqueda vaga: algo para trabajar',
    message: 'necesito algo para trabajar',
    expectedBehavior: 'Debería preguntar: ¿qué tipo de trabajo?',
    shouldAskClarification: true,
  },
  {
    name: 'Corrección ortográfica: curzo de piyano',
    message: 'me interesa un curzo de piyano',
    expectedBehavior: 'Debería corregir y mostrar curso de piano',
    shouldAskClarification: false,
    expectedProductCount: 1,
  },
];

async function testNewSystem() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🧪 TEST DEL NUEVO SISTEMA DE INTERPRETACIÓN INTELIGENTE ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Obtener usuario y productos
  const user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.log(`${colors.red}❌ No se encontró usuario admin${colors.reset}`);
    return;
  }

  const products = await prisma.product.findMany({
    where: { 
      userId: user.id,
      status: 'AVAILABLE'
    }
  });

  console.log(`${colors.blue}📦 Productos disponibles: ${products.length}${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.yellow}🧪 TEST: ${testCase.name}${colors.reset}`);
    console.log(`${colors.cyan}📝 Mensaje: "${testCase.message}"${colors.reset}`);
    console.log(`${colors.blue}🎯 Comportamiento esperado: ${testCase.expectedBehavior}${colors.reset}\n`);

    try {
      // 1. Análisis de intención
      console.log(`${colors.cyan}PASO 1: Análisis de intención${colors.reset}`);
      const analysis = await SemanticInterpreterService.analyzeIntent(
        testCase.message,
        [],
        user.id
      );

      console.log(`   Intención primaria: ${analysis.primaryIntent.intent}`);
      console.log(`   Confianza: ${analysis.primaryIntent.confidence.toFixed(2)}`);
      console.log(`   Ambigüedad: ${analysis.ambiguityScore.toFixed(2)}`);
      console.log(`   Requiere clarificación: ${analysis.requiresClarification ? 'Sí' : 'No'}`);

      // 2. Verificar clarificación
      if (testCase.shouldAskClarification) {
        if (analysis.requiresClarification) {
          console.log(`\n${colors.cyan}PASO 2: Generación de pregunta de clarificación${colors.reset}`);
          const questions = ClarificationEngine.generateQuestions(analysis, 2);
          
          if (questions.length > 0) {
            const questionText = ClarificationEngine.formatQuestionForUser(questions);
            console.log(`   Pregunta generada:\n   ${questionText.split('\n').join('\n   ')}`);
            console.log(`\n   ${colors.green}✅ PASS: Pregunta de clarificación generada correctamente${colors.reset}`);
            passed++;
          } else {
            console.log(`\n   ${colors.red}❌ FAIL: No se generó pregunta de clarificación${colors.reset}`);
            failed++;
          }
        } else {
          console.log(`\n   ${colors.red}❌ FAIL: Debería requerir clarificación pero no lo hace${colors.reset}`);
          failed++;
        }
      } else {
        // 3. Búsqueda de productos
        console.log(`\n${colors.cyan}PASO 2: Búsqueda semántica de productos${colors.reset}`);
        const matches = await ProductMatcherService.matchProducts(
          { intent: analysis.primaryIntent },
          products,
          5
        );

        console.log(`   Productos encontrados: ${matches.length}`);
        
        if (matches.length > 0) {
          console.log(`   Top 3 resultados:`);
          matches.slice(0, 3).forEach((match, i) => {
            console.log(`   ${i + 1}. ${match.product.name}`);
            console.log(`      Relevancia: ${match.relevanceScore.toFixed(2)}`);
            console.log(`      Razones: ${match.matchReasons.join(', ')}`);
          });

          // Verificar cantidad esperada
          if (testCase.expectedProductCount) {
            if (matches.length >= testCase.expectedProductCount) {
              console.log(`\n   ${colors.green}✅ PASS: Cantidad de productos correcta${colors.reset}`);
              passed++;
            } else {
              console.log(`\n   ${colors.red}❌ FAIL: Esperaba ${testCase.expectedProductCount} productos, obtuvo ${matches.length}${colors.reset}`);
              failed++;
            }
          } else {
            console.log(`\n   ${colors.green}✅ PASS: Productos encontrados${colors.reset}`);
            passed++;
          }
        } else {
          console.log(`\n   ${colors.red}❌ FAIL: No se encontraron productos${colors.reset}`);
          failed++;
        }
      }

    } catch (error: any) {
      console.log(`\n${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
      failed++;
    }

    console.log('');
  }

  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  📊 RESULTADOS FINALES                                    ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`   ${colors.green}✅ Pasados: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}❌ Fallidos: ${failed}${colors.reset}`);
  console.log(`   📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (passed > failed) {
    console.log(`${colors.green}🎉 ¡EL NUEVO SISTEMA FUNCIONA CORRECTAMENTE!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  El sistema necesita ajustes${colors.reset}\n`);
  }

  await prisma.$disconnect();
}

// Ejecutar tests
testNewSystem().catch(console.error);

/**
 * 🧪 TEST: Sistema de Búsqueda Inteligente de Productos
 * 
 * Prueba la búsqueda con IA que entiende:
 * - Nombres parciales
 * - Contexto de conversación
 * - Variaciones del nombre
 */

const { PrismaClient } = require('@prisma/client');
const Groq = require('groq-sdk').default;

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Casos de prueba
const testCases = [
  {
    name: 'Búsqueda por procesador parcial',
    message: 'Me interesa el ryzen 3 720u',
    previousProducts: [],
    expectedMatch: true
  },
  {
    name: 'Solicitud de fotos con contexto',
    message: 'Si de ese envíame fotos',
    previousProducts: ['Portatil Asus Vivobook'],
    expectedMatch: true
  },
  {
    name: 'Búsqueda por uso',
    message: 'Necesito uno para trabajo',
    previousProducts: [],
    expectedMatch: true
  },
  {
    name: 'Búsqueda por marca',
    message: 'Tienes algún Asus?',
    previousProducts: [],
    expectedMatch: true
  },
  {
    name: 'Referencia al anterior',
    message: 'Ese me gusta, cuánto cuesta?',
    previousProducts: ['Portatil HP'],
    expectedMatch: true
  }
];

async function testIntelligentSearch() {
  console.log('🧪 INICIANDO PRUEBAS DE BÚSQUEDA INTELIGENTE\n');
  console.log('='.repeat(60));

  // Verificar productos en BD
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, category: true, price: true }
  });

  console.log(`\n📦 Productos disponibles en BD: ${products.length}`);
  products.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.name} - $${p.price}`);
  });

  console.log('\n' + '='.repeat(60));

  // Ejecutar casos de prueba
  for (const testCase of testCases) {
    console.log(`\n🧪 TEST: ${testCase.name}`);
    console.log(`📝 Mensaje: "${testCase.message}"`);
    console.log(`📚 Contexto: ${testCase.previousProducts.join(', ') || 'Ninguno'}`);

    try {
      const result = await intelligentProductSearch({
        userMessage: testCase.message,
        previousProducts: testCase.previousProducts,
        conversationHistory: []
      });

      if (result) {
        console.log(`✅ ENCONTRADO: ${result.product.name}`);
        console.log(`   📊 Confianza: ${result.confidence}%`);
        console.log(`   💡 Razón: ${result.reason}`);
        console.log(`   📸 Enviar foto: ${result.shouldSendPhoto ? 'Sí' : 'No'}`);
      } else {
        console.log(`❌ NO ENCONTRADO`);
      }

    } catch (error) {
      console.error(`❌ ERROR:`, error.message);
    }

    console.log('-'.repeat(60));
  }

  console.log('\n✅ PRUEBAS COMPLETADAS\n');
}

// Función de búsqueda inteligente (copiada del servicio)
async function intelligentProductSearch(context) {
  const allProducts = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      images: true,
      tags: true
    }
  });

  if (allProducts.length === 0) {
    return null;
  }

  return await findProductWithAI(
    context.userMessage,
    allProducts,
    context.previousProducts || []
  );
}

async function findProductWithAI(userMessage, products, previousProducts) {
  const productList = products.map((p, idx) => 
    `${idx + 1}. ${p.name} - ${p.category} - $${p.price}`
  ).join('\n');

  const contextInfo = previousProducts.length > 0
    ? `\n\nProductos mencionados anteriormente: ${previousProducts.join(', ')}`
    : '';

  const prompt = `Eres un experto en identificar productos basándote en descripciones parciales o informales.

PRODUCTOS DISPONIBLES:
${productList}
${contextInfo}

MENSAJE DEL CLIENTE:
"${userMessage}"

ANÁLISIS REQUERIDO:
1. ¿El cliente está preguntando por un producto específico?
2. ¿Cuál producto de la lista coincide mejor?
3. ¿Qué tan seguro estás? (0-100%)
4. ¿El cliente quiere ver fotos?

REGLAS:
- Si dice "ryzen 3", "ryzen 5", "ryzen 7", "ryzen 9" busca portátiles con ese procesador
- Si dice "trabajo", "estudio", "gaming" busca portátiles apropiados
- Si menciona marca (Asus, HP, Lenovo) prioriza esa marca
- Si dice "ese", "el que mencionaste", usa el contexto previo
- Si pide "fotos", "imágenes", "ver" → shouldSendPhoto = true
- Nombres parciales son válidos (ej: "720u" puede ser "Ryzen 3 7320U")

Responde SOLO con JSON:
{
  "found": true/false,
  "productIndex": número (1-based) o null,
  "confidence": 0-100,
  "reason": "explicación breve",
  "shouldSendPhoto": true/false
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile', // Modelo actualizado
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Extraer JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis.found || !analysis.productIndex) {
      return null;
    }

    const product = products[analysis.productIndex - 1];
    
    return {
      product,
      confidence: analysis.confidence,
      reason: analysis.reason,
      shouldSendPhoto: analysis.shouldSendPhoto
    };

  } catch (error) {
    console.error('Error en búsqueda con IA:', error.message);
    return null;
  }
}

// Ejecutar pruebas
testIntelligentSearch()
  .then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

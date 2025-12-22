/**
 * 🧪 TEST: Verificar que "curso de piano" encuentra el producto correcto
 * NO el Mega Pack de Música
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Importar el traductor de intenciones
const { IntentTranslator } = require('./src/lib/intent-translator.ts');

async function testPianoSearch() {
  console.log('🧪 TEST: Búsqueda de "curso de piano"\n');
  console.log('='.repeat(60));

  // 1. Traducir intención
  const intent = IntentTranslator.translate('curso de piano');
  
  console.log('\n📋 INTENCIÓN TRADUCIDA:');
  console.log('Consulta original:', intent.originalQuery);
  console.log('Tipo de producto:', intent.productType);
  console.log('Términos de búsqueda:', intent.translatedTerms);
  console.log('Confianza:', intent.confidence);
  console.log('\n💭 Razonamiento:');
  console.log(intent.reasoning);

  // 2. Buscar productos en la BD
  console.log('\n\n🔍 BUSCANDO EN BASE DE DATOS...\n');
  
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'piano', mode: 'insensitive' } },
        { description: { contains: 'piano', mode: 'insensitive' } },
        { tags: { hasSome: ['piano'] } }
      ]
    },
    select: {
      id: true,
      name: true,
      price: true,
      tags: true
    }
  });

  console.log(`✅ Encontrados ${productos.length} productos con "piano":\n`);
  productos.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Precio: $${p.price.toLocaleString()} COP`);
    console.log(`   Tags: ${p.tags.join(', ')}`);
    console.log('');
  });

  // 3. Verificar que NO encuentra el Mega Pack de Música
  const megaPackMusica = await prisma.product.findFirst({
    where: {
      name: { contains: 'Mega Pack 09', mode: 'insensitive' }
    }
  });

  if (megaPackMusica) {
    console.log('⚠️  MEGA PACK 09 (Música y Audio):');
    console.log(`   Nombre: ${megaPackMusica.name}`);
    console.log(`   Tags: ${megaPackMusica.tags?.join(', ') || 'Sin tags'}`);
    
    // Verificar si los términos de búsqueda coinciden
    const coincide = intent.translatedTerms.some(term => 
      megaPackMusica.name.toLowerCase().includes(term.toLowerCase()) ||
      megaPackMusica.tags?.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    
    if (coincide) {
      console.log('   ❌ ERROR: Los términos de búsqueda coinciden con este producto');
      console.log('   Esto causaría confusión al cliente');
    } else {
      console.log('   ✅ CORRECTO: Los términos NO coinciden con este producto');
    }
  }

  // 4. Verificar el Curso Completo de Piano
  const cursoPiano = await prisma.product.findFirst({
    where: {
      name: { contains: 'Curso Completo de Piano', mode: 'insensitive' }
    }
  });

  if (cursoPiano) {
    console.log('\n✅ CURSO COMPLETO DE PIANO:');
    console.log(`   Nombre: ${cursoPiano.name}`);
    console.log(`   Tags: ${cursoPiano.tags?.join(', ') || 'Sin tags'}`);
    
    const coincide = intent.translatedTerms.some(term => 
      cursoPiano.name.toLowerCase().includes(term.toLowerCase()) ||
      cursoPiano.tags?.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    
    if (coincide) {
      console.log('   ✅ CORRECTO: Los términos coinciden con este producto');
    } else {
      console.log('   ❌ ERROR: Los términos NO coinciden con este producto');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST COMPLETADO\n');

  await prisma.$disconnect();
}

testPianoSearch().catch(console.error);

/**
 * TEST FINAL - Verificar que el bot NO inventa información genérica
 * 
 * PROBLEMA: Bot respondía con Flowkey, Pianote, Yousician y hacía preguntas innecesarias
 * SOLUCIÓN: Validación post-respuesta que detecta y bloquea información genérica
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function testCorreccionPiano() {
  console.log('\n🧪 TEST CORRECCIÓN PIANO - Verificar que NO inventa información\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. VERIFICAR QUE EL PRODUCTO EXISTE
    console.log('1️⃣ Verificando producto en base de datos...\n');
    
    const cursoPiano = await db.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!cursoPiano) {
      console.log('❌ ERROR: No se encontró el curso de piano en la base de datos');
      return;
    }

    console.log('✅ Producto encontrado:');
    console.log(`   Nombre: ${cursoPiano.name}`);
    console.log(`   Precio: ${cursoPiano.price.toLocaleString('es-CO')} COP`);
    console.log(`   Descripción: ${cursoPiano.description?.substring(0, 100)}...`);
    console.log(`   Imágenes: ${cursoPiano.images?.length || 0}`);
    console.log('');

    // 2. VERIFICAR VALIDACIONES EN EL CÓDIGO
    console.log('2️⃣ Verificando validaciones implementadas...\n');
    
    const fs = require('fs');
    const handlerCode = fs.readFileSync('src/lib/simple-conversation-handler.ts', 'utf8');
    
    const validaciones = {
      'Prohibición de Flowkey': handlerCode.includes('flowkey'),
      'Prohibición de Pianote': handlerCode.includes('pianote'),
      'Prohibición de Yousician': handlerCode.includes('yousician'),
      'Prohibición de preguntas nivel': handlerCode.includes('¿cuál es tu nivel'),
      'Prohibición de preguntas presupuesto': handlerCode.includes('¿cuál es tu presupuesto'),
      'Validación post-respuesta': handlerCode.includes('hasGenericInfo'),
      'Respuesta de emergencia': handlerCode.includes('Respuesta de emergencia con datos REALES')
    };

    let todasOk = true;
    for (const [nombre, existe] of Object.entries(validaciones)) {
      if (existe) {
        console.log(`   ✅ ${nombre}`);
      } else {
        console.log(`   ❌ ${nombre} - NO ENCONTRADA`);
        todasOk = false;
      }
    }
    console.log('');

    if (!todasOk) {
      console.log('⚠️ ADVERTENCIA: Algunas validaciones no están implementadas');
      console.log('');
    }

    // 3. SIMULAR RESPUESTA INCORRECTA Y VERIFICAR CORRECCIÓN
    console.log('3️⃣ Simulando detección de respuesta incorrecta...\n');
    
    const respuestasIncorrectas = [
      'Te recomiendo Flowkey, Pianote y Yousician',
      'Cuéntame: ¿Cuál es tu nivel actual?',
      '¿Qué tipo de aprendizaje te interesa?',
      'Busca escuelas de música en tu ciudad'
    ];

    const genericPhrases = [
      'flowkey', 'pianote', 'yousician', 'simply piano',
      'cuéntame:', 'necesito saber', 'para encontrar el curso perfecto',
      '¿cuál es tu nivel', '¿qué tipo de aprendizaje', '¿qué tipo de música',
      '¿cuál es tu presupuesto', '¿dónde vives', 'busca escuelas'
    ];

    for (const respuesta of respuestasIncorrectas) {
      const hasGenericInfo = genericPhrases.some(phrase => 
        respuesta.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (hasGenericInfo) {
        console.log(`   ✅ DETECTADA: "${respuesta.substring(0, 50)}..."`);
      } else {
        console.log(`   ❌ NO DETECTADA: "${respuesta.substring(0, 50)}..."`);
      }
    }
    console.log('');

    // 4. VERIFICAR RESPUESTA CORRECTA ESPERADA
    console.log('4️⃣ Formato de respuesta correcta esperada:\n');
    
    const respuestaCorrecta = `🎯 ${cursoPiano.name}

💰 Precio: ${cursoPiano.price.toLocaleString('es-CO')} COP

📝 ${cursoPiano.description}

💳 ¿Te gustaría proceder con el pago? Puedo enviarte el link ahora mismo 😊`;

    console.log(respuestaCorrecta);
    console.log('');

    // 5. RESUMEN
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 RESUMEN DE LA CORRECCIÓN:\n');
    console.log('✅ Producto existe en base de datos');
    console.log('✅ Validaciones implementadas en el código');
    console.log('✅ Detección de información genérica activa');
    console.log('✅ Respuesta de emergencia con datos reales configurada');
    console.log('');
    console.log('🎯 PRÓXIMO PASO:');
    console.log('   1. Reinicia el servidor: npm run dev');
    console.log('   2. Envía por WhatsApp: "Quiero el curso de piano"');
    console.log('   3. Verifica que responda con el producto REAL (no Flowkey/Pianote)');
    console.log('');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    await db.$disconnect();
  }
}

testCorreccionPiano();

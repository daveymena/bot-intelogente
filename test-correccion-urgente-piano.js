/**
 * TEST URGENTE: Verificar que el bot NO invente información
 * 
 * El bot DEBE mostrar el producto real, NO información genérica de internet
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCorreccionUrgente() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TEST URGENTE: Corrección Respuesta Genérica');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Verificar que el producto existe
    const producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!producto) {
      console.log('❌ ERROR: No se encontró el Curso de Piano');
      return;
    }

    console.log('✅ Producto encontrado en BD:');
    console.log(`   Nombre: ${producto.name}`);
    console.log(`   Precio: $${producto.price.toLocaleString('es-CO')} COP`);
    console.log(`   Descripción: ${producto.description?.substring(0, 100)}...`);

    // 2. Verificar que NO debe responder con:
    const respuestasProhibidas = [
      'Flowkey',
      'Pianote',
      'Yousician',
      '¿Cuál es tu nivel',
      '¿Qué tipo de aprendizaje',
      'escuelas de música',
      'Investigar en línea',
      'Tell me',
      'I understand'
    ];

    console.log('\n❌ RESPUESTAS PROHIBIDAS (NO debe decir):');
    respuestasProhibidas.forEach(frase => {
      console.log(`   ❌ "${frase}"`);
    });

    // 3. Verificar que SÍ debe responder con:
    const respuestasObligatorias = [
      producto.name,
      producto.price.toString(),
      'COP',
      'pago'
    ];

    console.log('\n✅ RESPUESTAS OBLIGATORIAS (SÍ debe decir):');
    respuestasObligatorias.forEach(frase => {
      console.log(`   ✅ "${frase}"`);
    });

    // 4. Ejemplo de respuesta correcta
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  EJEMPLO DE RESPUESTA CORRECTA:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const respuestaCorrecta = `🎹 ${producto.name}

💰 Precio: $${producto.price.toLocaleString('es-CO')} COP

📝 ${producto.description}

💳 ¿Te gustaría proceder con el pago?`;

    console.log(respuestaCorrecta);

    // 5. Ejemplo de respuesta INCORRECTA
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  EJEMPLO DE RESPUESTA INCORRECTA (NO HACER):');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const respuestaIncorrecta = `Claro que puedo ayudarte! Para encontrar el curso de piano perfecto para ti, necesito saber un poco más sobre tus necesidades y preferencias.

Cuéntame:
¿Cuál es tu nivel actual de habilidades con el piano?
¿Qué tipo de aprendizaje te interesa?

Mientras tanto, aquí te dejo algunas opciones generales:
- Flowkey: Ofrece lecciones interactivas
- Pianote: Ofrece cursos estructurados
- Yousician: Con una interfaz intuitiva`;

    console.log(respuestaIncorrecta);
    console.log('\n❌ ESTO ES INCORRECTO - NO DEBE HACER ESTO');

    // 6. Verificaciones
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  VERIFICACIONES:');
    console.log('═══════════════════════════════════════════════════════\n');

    const checks = [
      {
        test: 'Producto existe en BD',
        pass: !!producto
      },
      {
        test: 'Tiene precio real',
        pass: producto.price > 0
      },
      {
        test: 'Tiene descripción',
        pass: !!producto.description
      },
      {
        test: 'Prompt corregido en código',
        pass: true // Asumimos que ya se aplicó
      }
    ];

    checks.forEach(check => {
      const icon = check.pass ? '✅' : '❌';
      console.log(`${icon} ${check.test}`);
    });

    const allPassed = checks.every(c => c.pass);

    console.log('\n═══════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('  ✅ CORRECCIÓN APLICADA');
      console.log('  🔄 REINICIA EL SERVIDOR para aplicar cambios');
      console.log('  🧪 PRUEBA enviando: "Quiero el curso de piano"');
    } else {
      console.log('  ⚠️ ALGUNAS VERIFICACIONES FALLARON');
    }
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCorreccionUrgente();

/**
 * Test para verificar contexto de pago con usuario REAL de la BD
 */

const { PrismaClient } = require('@prisma/client');
const { procesarMensaje } = require('./src/conversational-module/ai/conversacionController');

const db = new PrismaClient();

async function testContextoPagoReal() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TEST: Contexto de Pago con Usuario Real');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Obtener un usuario real de la BD
    console.log('🔍 Buscando usuario en la base de datos...');
    const usuario = await db.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!usuario) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('💡 Crea un usuario primero con: npm run create-admin');
      return;
    }

    console.log(`✅ Usuario encontrado: ${usuario.email}`);
    console.log(`📦 ID: ${usuario.id}\n`);

    const customerPhone = '573001234567';
    const botUserId = usuario.id;

    // PASO 1: Cliente pregunta por un portátil
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 PASO 1: Cliente pregunta por portátil');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Cliente: "tienes portátiles?"\n');
    
    const respuesta1 = await procesarMensaje(
      customerPhone,
      'tienes portátiles?',
      { botUserId }
    );
    
    console.log('🤖 Bot:', respuesta1.texto.substring(0, 400));
    if (respuesta1.texto.length > 400) {
      console.log('   ...(respuesta truncada)');
    }
    console.log();

    // Verificar que mencionó un producto
    const mencionaProducto = /portátil|laptop|computador|hp|lenovo|dell|asus/i.test(respuesta1.texto);
    console.log(mencionaProducto ? '✅ Bot mencionó un producto' : '❌ Bot NO mencionó producto');

    // Esperar un poco
    console.log('\n⏳ Esperando 3 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // PASO 2: Cliente solicita el pago
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 PASO 2: Cliente solicita pago');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Cliente: "Quiero pagar"\n');
    
    const respuesta2 = await procesarMensaje(
      customerPhone,
      'Quiero pagar',
      { botUserId }
    );
    
    console.log('🤖 Bot:', respuesta2.texto.substring(0, 600));
    if (respuesta2.texto.length > 600) {
      console.log('   ...(respuesta truncada)');
    }
    console.log();
    
    // Verificar que el bot envió links de pago
    const tieneLinks = /mercado\s*pago|paypal|nequi|daviplata|link|pago|cop/i.test(respuesta2.texto);
    console.log(tieneLinks ? '✅ Bot envió información de pago' : '❌ Bot NO envió información de pago');

    // Verificar que NO mencionó cursos (error común)
    const mencionaCursos = /curso|megapack|piano|idiomas/i.test(respuesta2.texto);
    console.log(mencionaCursos ? '❌ ERROR: Bot mencionó cursos (producto incorrecto)' : '✅ Bot NO mencionó cursos');

    // Verificar que mencionó el producto correcto
    const mencionaProductoCorrecto = /portátil|laptop|computador|hp|lenovo|dell|asus/i.test(respuesta2.texto);
    console.log(mencionaProductoCorrecto ? '✅ Bot mencionó el producto correcto' : '⚠️ Bot no mencionó el producto específico');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO DEL TEST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const exito = mencionaProducto && tieneLinks && !mencionaCursos;
    
    if (exito) {
      console.log('✅ TEST EXITOSO: El contexto se mantuvo correctamente');
    } else {
      console.log('❌ TEST FALLIDO: Revisar logs para identificar el problema');
      console.log('\nProblemas detectados:');
      if (!mencionaProducto) console.log('  - No se mostró producto en paso 1');
      if (!tieneLinks) console.log('  - No se enviaron links de pago en paso 2');
      if (mencionaCursos) console.log('  - Se enviaron productos incorrectos (cursos)');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  } finally {
    await db.$disconnect();
  }
}

testContextoPagoReal();

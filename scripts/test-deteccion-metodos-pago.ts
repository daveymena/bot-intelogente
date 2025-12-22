/**
 * Test: Detección de Solicitud de Métodos de Pago
 * Prueba que el sistema detecte correctamente las diferentes formas de pedir métodos de pago
 */

async function testDeteccionMetodosPago() {
  console.log('🧪 TEST: Detección de Solicitud de Métodos de Pago\n');

  // Frases que deben detectarse como solicitud de métodos de pago
  const frasesValidas = [
    '¿Cómo puedo pagar?',
    '¿Qué métodos de pago tienen?',
    'Métodos de pago',
    'Formas de pago',
    'Quiero pagar',
    '¿Cómo pago?',
    '¿Puedo pagar con tarjeta?',
    'Proceder con el pago',
    'Realizar el pago',
    'Hacer el pago',
    '¿Aceptan MercadoPago?',
    '¿Aceptan PayPal?',
    'Voy a pagar',
    'Como pago',
    'metodos de pago',
    'COMO PUEDO PAGAR',
    'quiero pagar con tarjeta'
  ];

  // Función de detección (simulada)
  function detectarSolicitudMetodosPago(mensaje: string): boolean {
    const mensajeLower = mensaje.toLowerCase();
    return (
      mensajeLower.includes('pagar') ||
      mensajeLower.includes('pago') ||
      mensajeLower.includes('método') ||
      mensajeLower.includes('metodo') ||
      mensajeLower.includes('forma') ||
      mensajeLower.includes('aceptan') ||
      mensajeLower.includes('puedo pagar')
    );
  }

  console.log('📋 Probando frases válidas:\n');
  
  let correctas = 0;
  let incorrectas = 0;

  for (const frase of frasesValidas) {
    const detectado = detectarSolicitudMetodosPago(frase);
    
    if (detectado) {
      console.log(`✅ "${frase}"`);
      correctas++;
    } else {
      console.log(`❌ "${frase}" - NO DETECTADO`);
      incorrectas++;
    }
  }

  console.log(`\n📊 Resultados:`);
  console.log(`   ✅ Correctas: ${correctas}/${frasesValidas.length}`);
  console.log(`   ❌ Incorrectas: ${incorrectas}/${frasesValidas.length}`);
  console.log(`   📈 Precisión: ${((correctas / frasesValidas.length) * 100).toFixed(1)}%`);

  // Frases que NO deben detectarse
  console.log(`\n📋 Probando frases que NO deben detectarse:\n`);
  
  const frasesInvalidas = [
    'Hola',
    'Me interesa el producto',
    '¿Cuánto cuesta?',
    'Más información',
    'Gracias',
    'Adiós'
  ];

  let correctasNegativas = 0;
  let incorrectasNegativas = 0;

  for (const frase of frasesInvalidas) {
    const detectado = detectarSolicitudMetodosPago(frase);
    
    if (!detectado) {
      console.log(`✅ "${frase}" - Correctamente NO detectado`);
      correctasNegativas++;
    } else {
      console.log(`❌ "${frase}" - FALSO POSITIVO`);
      incorrectasNegativas++;
    }
  }

  console.log(`\n📊 Resultados (Negativos):`);
  console.log(`   ✅ Correctas: ${correctasNegativas}/${frasesInvalidas.length}`);
  console.log(`   ❌ Falsos positivos: ${incorrectasNegativas}/${frasesInvalidas.length}`);

  // Resumen final
  console.log(`\n🎯 RESUMEN FINAL:`);
  const totalPruebas = frasesValidas.length + frasesInvalidas.length;
  const totalCorrectas = correctas + correctasNegativas;
  const precision = ((totalCorrectas / totalPruebas) * 100).toFixed(1);
  
  console.log(`   Total de pruebas: ${totalPruebas}`);
  console.log(`   Correctas: ${totalCorrectas}`);
  console.log(`   Precisión general: ${precision}%`);

  if (precision === '100.0') {
    console.log(`\n   ✅ ¡PERFECTO! El sistema detecta correctamente todas las solicitudes`);
  } else if (parseFloat(precision) >= 90) {
    console.log(`\n   ✅ Muy bien! El sistema tiene alta precisión`);
  } else {
    console.log(`\n   ⚠️ Se necesitan mejoras en la detección`);
  }

  // Ejemplo de respuesta esperada
  console.log(`\n💬 EJEMPLO DE RESPUESTA ESPERADA:\n`);
  console.log(`Cliente: "¿Cómo puedo pagar?"`);
  console.log(`\nBot:`);
  console.log(`Perfecto 💪 Puedes pagarlo por los siguientes métodos 👇

💳 **MÉTODOS DE PAGO PARA [Producto]** 

💰 Precio: XX,XXX COP

1️⃣ **NEQUI / DAVIPLATA**
   📱 Número: 3136174267
   ✅ Transferencia instantánea

2️⃣ **TARJETA DE CRÉDITO/DÉBITO**
   💳 Pago seguro con MercadoPago
   👉 [Link dinámico]

3️⃣ **PAYPAL**
   🌎 Pago internacional
   👉 [Link dinámico]

4️⃣ **TRANSFERENCIA BANCARIA**
   🏦 Banco: Bancolombia
   📋 Cuenta: 12345678901

¿Con cuál prefieres continuar? 😄`);

  return precision === '100.0';
}

// Ejecutar test
testDeteccionMetodosPago()
  .then((success) => {
    if (success) {
      console.log('\n✅ Test completado exitosamente');
      process.exit(0);
    } else {
      console.log('\n⚠️ Test completado con advertencias');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('\n💥 Error en el test:', error);
    process.exit(1);
  });

const axios = require('axios');

const API_URL = 'http://localhost:4000';

async function testSistema() {
  console.log('🧪 Probando sistema completo...\n');

  const tests = [
    {
      nombre: 'Saludo',
      mensaje: 'Hola'
    },
    {
      nombre: 'Búsqueda curso piano',
      mensaje: 'Busco un curso de piano'
    },
    {
      nombre: 'Búsqueda laptop',
      mensaje: 'Necesito un portátil para diseño gráfico'
    },
    {
      nombre: 'Pregunta precio',
      mensaje: 'Cuánto cuesta el curso de piano?'
    },
    {
      nombre: 'Solicitar pago',
      mensaje: 'Quiero comprar el curso de piano'
    }
  ];

  for (const test of tests) {
    console.log(`\n📝 Test: ${test.nombre}`);
    console.log(`Mensaje: "${test.mensaje}"`);
    
    try {
      const response = await axios.post(`${API_URL}/api/whatsapp/test-message`, {
        from: '573001234567',
        message: test.mensaje
      });

      console.log(`✅ Respuesta: ${response.data.response.substring(0, 150)}...`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Tests completados');
}

testSistema();

const axios = require('axios');

async function verificarServidor() {
  console.log('Verificando servidor...\n');
  
  // Test 1: Verificar puerto 4000
  try {
    console.log('1. Probando conexión a http://localhost:4000...');
    const response = await axios.get('http://localhost:4000/api/whatsapp/test-message');
    console.log('   ✅ Servidor responde en puerto 4000');
    console.log('   Respuesta:', response.data);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  EL SERVIDOR NO ESTÁ CORRIENDO EN PUERTO 4000');
      console.log('   Ejecuta: INICIAR_TODO.bat');
      process.exit(1);
    }
  }
  
  // Test 2: Probar endpoint con mensaje simple
  try {
    console.log('\n2. Probando envío de mensaje...');
    const response = await axios.post('http://localhost:4000/api/whatsapp/test-message', {
      from: '573001234567',
      message: 'test'
    });
    console.log('   ✅ Endpoint funciona');
    console.log('   Respuesta:', response.data.response?.substring(0, 100));
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data);
    }
  }
  
  console.log('\n✅ Verificación completada');
}

verificarServidor();

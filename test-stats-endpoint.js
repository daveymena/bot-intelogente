// Test para verificar el endpoint de stats

async function testStatsEndpoint() {
  console.log('🧪 PROBANDO ENDPOINT DE STATS\n');
  console.log('='.repeat(50));

  try {
    // Probar sin autenticación
    console.log('\n1️⃣ Probando sin autenticación...');
    const response1 = await fetch('http://localhost:3000/api/stats/overview');
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Respuesta:', JSON.stringify(data1, null, 2));

    // Probar con cookie de sesión (si existe)
    console.log('\n2️⃣ Probando con cookies del navegador...');
    console.log('   (Debes estar logueado en el navegador)');
    console.log('   Abre: http://localhost:3000/api/stats/overview');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStatsEndpoint();

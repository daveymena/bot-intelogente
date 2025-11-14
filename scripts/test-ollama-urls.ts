/**
 * 🧪 PROBAR URLs DE OLLAMA
 * Verifica cuál URL funciona para tu configuración
 */

async function testOllamaURL(url: string, nombre: string) {
  console.log(`\n🔍 Probando ${nombre}:`);
  console.log(`   URL: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${url}/api/tags`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      
      console.log(`   ✅ FUNCIONA`);
      console.log(`   📦 Modelos disponibles: ${models.length}`);
      
      if (models.length > 0) {
        models.forEach((m: any) => {
          console.log(`      - ${m.name}`);
        });
      }
      
      return true;
    } else {
      console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`   ❌ Timeout (más de 10 segundos)`);
    } else {
      console.log(`   ❌ Error: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('🤖 PRUEBA DE URLs DE OLLAMA\n');
  console.log('='.repeat(60));

  // Probar URL interna de Docker
  const urlInterna = 'http://bot-whatsapp_ollama:11434';
  const funcionaInterna = await testOllamaURL(urlInterna, 'URL Interna (Docker)');

  // Probar URL pública
  const urlPublica = 'https://bot-whatsapp-ollama.sqaoeo.easypanel.host';
  const funcionaPublica = await testOllamaURL(urlPublica, 'URL Pública (HTTPS)');

  // Probar URL actual del .env
  const urlEnv = process.env.OLLAMA_BASE_URL || 'no configurada';
  if (urlEnv !== urlInterna && urlEnv !== urlPublica && urlEnv !== 'no configurada') {
    await testOllamaURL(urlEnv, 'URL en .env');
  }

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN\n');

  if (funcionaInterna) {
    console.log('✅ URL Interna funciona');
    console.log('   💡 Tu bot está corriendo EN Easypanel');
    console.log('   📝 Usa en .env: OLLAMA_BASE_URL=' + urlInterna);
  }

  if (funcionaPublica) {
    console.log('✅ URL Pública funciona');
    console.log('   💡 Tu bot está corriendo LOCAL o fuera de Easypanel');
    console.log('   📝 Usa en .env: OLLAMA_BASE_URL=' + urlPublica);
  }

  if (!funcionaInterna && !funcionaPublica) {
    console.log('❌ Ninguna URL funciona');
    console.log('\n🔧 SOLUCIONES:');
    console.log('   1. Verifica que Ollama esté corriendo en Easypanel');
    console.log('   2. Revisa los logs del contenedor Ollama');
    console.log('   3. Verifica que el puerto 11434 esté expuesto');
    console.log('   4. Prueba acceder manualmente: ' + urlPublica + '/api/tags');
  }

  console.log('\n💡 RECOMENDACIÓN:');
  if (funcionaInterna && funcionaPublica) {
    console.log('   - Si despliegas en Easypanel: Usa URL interna (más rápida)');
    console.log('   - Si desarrollas local: Usa URL pública');
  } else if (funcionaInterna) {
    console.log('   - Usa URL interna: ' + urlInterna);
  } else if (funcionaPublica) {
    console.log('   - Usa URL pública: ' + urlPublica);
  }

  console.log('');
}

main();

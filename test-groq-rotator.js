/**
 * 🧪 TEST: Sistema de Rotación de APIs Groq
 * 
 * Prueba el sistema de rotación automática de APIs
 */

const { GroqAPIRotator } = require('./src/lib/groq-api-rotator.ts');

async function testRotator() {
    console.log('🧪 INICIANDO PRUEBAS DEL ROTADOR DE APIs\n');
    console.log('='.repeat(60));

    // 1. Mostrar estado inicial
    console.log('\n📊 ESTADO INICIAL:');
    const initialStatus = GroqAPIRotator.getStatus();
    console.log(`   APIs disponibles: ${initialStatus.apis.length}`);
    console.log(`   Modelos disponibles: ${initialStatus.models.length}`);
    console.log(`   API actual: ${initialStatus.currentAPI}`);
    console.log(`   Modelo actual: ${initialStatus.currentModel}`);

    // 2. Probar llamada simple
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 TEST 1: Llamada simple');
    try {
        const response = await GroqAPIRotator.makeRequest([
            { role: 'user', content: 'Di "Hola" en una palabra' }
        ]);
        console.log('✅ Respuesta recibida:', response.substring(0, 50));
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // 3. Probar múltiples llamadas
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 TEST 2: Múltiples llamadas (5)');
    for (let i = 1; i <= 5; i++) {
        try {
            console.log(`\n   Llamada ${i}/5...`);
            const response = await GroqAPIRotator.makeRequest([
                { role: 'user', content: `Di el número ${i}` }
            ]);
            console.log(`   ✅ Respuesta ${i}:`, response.substring(0, 30));
        } catch (error) {
            console.error(`   ❌ Error en llamada ${i}:`, error.message);
        }
    }

    // 4. Mostrar estado final
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 ESTADO FINAL:');
    const finalStatus = GroqAPIRotator.getStatus();
    
    console.log('\n   APIs:');
    finalStatus.apis.forEach(api => {
        const status = api.isActive ? '✅' : '❌';
        console.log(`   ${status} ${api.name}: ${api.failCount} fallos`);
        if (api.lastError) {
            console.log(`      Error: ${api.lastError}`);
        }
    });

    console.log('\n   Modelos:');
    finalStatus.models.forEach(model => {
        const status = model.isActive ? '✅' : '❌';
        console.log(`   ${status} ${model.name}: ${model.failCount} fallos`);
    });

    console.log(`\n   API actual: ${finalStatus.currentAPI}`);
    console.log(`   Modelo actual: ${finalStatus.currentModel}`);

    // 5. Probar búsqueda de producto
    console.log('\n' + '='.repeat(60));
    console.log('\n🧪 TEST 3: Búsqueda de producto');
    try {
        const response = await GroqAPIRotator.makeRequest([
            {
                role: 'user',
                content: `Analiza este mensaje de cliente: "Me interesa el ryzen 3 7320u"
                
Responde SOLO con JSON:
{
  "found": true/false,
  "productType": "laptop/phone/etc",
  "confidence": 0-100
}`
            }
        ], {
            temperature: 0.3,
            maxTokens: 200
        });

        console.log('✅ Análisis recibido:');
        console.log(response);

        // Intentar parsear JSON
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('\n📊 JSON parseado:', parsed);
            }
        } catch (e) {
            console.log('⚠️  No se pudo parsear JSON');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ PRUEBAS COMPLETADAS\n');
}

// Ejecutar pruebas
testRotator()
    .then(() => {
        console.log('🎉 Script completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });

import { AIService } from '../src/lib/ai-service';

async function testNoInventarEnlaces() {
  console.log('🧪 PRUEBA: Bot NO debe inventar enlaces\n');
  console.log('='.repeat(60));

  const testCases = [
    {
      name: 'Solicitud de link - Producto CON enlace',
      message: 'Dame el link del curso de piano',
      productContext: `
PRODUCTO ENCONTRADO:
- Nombre: Curso Completo de Piano
- Precio: $150,000 COP
- Categoría: DIGITAL
- ENLACE DE PAGO: https://hotmart.com/es/marketplace/productos/curso-piano
- Descripción: Aprende piano desde cero
      `,
      shouldContain: 'https://hotmart.com',
      shouldNotContain: ['[ENLACE DE ARRIBA]', '[ENLACE]', 'enlace de arriba']
    },
    {
      name: 'Solicitud de link - Producto SIN enlace',
      message: 'Quiero comprar el portátil HP',
      productContext: `
PRODUCTO ENCONTRADO:
- Nombre: Portátil HP 15-dy2021la
- Precio: $2,500,000 COP
- Categoría: FÍSICO
- Descripción: Intel Core i5, 8GB RAM, 256GB SSD
      `,
      shouldContain: '+57 304 274 8687',
      shouldNotContain: ['[ENLACE DE ARRIBA]', '[ENLACE]', 'https://', 'http://']
    },
    {
      name: 'Pregunta de precio',
      message: 'Cuánto cuesta?',
      productContext: `
PRODUCTO ENCONTRADO:
- Nombre: Megapack 20mil Cursos
- Precio: $50,000 COP
- Categoría: DIGITAL
- Descripción: 20,000 cursos digitales
      `,
      shouldContain: '$50,000',
      shouldNotContain: ['[PRECIO]', '[ENLACE DE ARRIBA]']
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('-'.repeat(60));
    console.log(`Cliente: "${testCase.message}"`);

    try {
      const aiResponse = await AIService.generateResponse(
        'test-user-id',
        testCase.message,
        '+57300000000',
        []
      );

      const response = aiResponse.message;
      console.log(`\n🤖 Bot: ${response}\n`);

      // Verificar que contiene lo esperado
      let passed = true;
      if (testCase.shouldContain) {
        const contains = Array.isArray(testCase.shouldContain)
          ? testCase.shouldContain.some(text => response.includes(text))
          : response.includes(testCase.shouldContain);
        
        if (!contains) {
          console.log(`❌ FALLO: No contiene "${testCase.shouldContain}"`);
          passed = false;
        }
      }

      // Verificar que NO contiene lo prohibido
      if (testCase.shouldNotContain) {
        for (const forbidden of testCase.shouldNotContain) {
          if (response.includes(forbidden)) {
            console.log(`❌ FALLO: Contiene texto prohibido "${forbidden}"`);
            passed = false;
          }
        }
      }

      if (passed) {
        console.log('✅ CORRECTO: Respuesta válida');
      }

    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Prueba completada');
}

testNoInventarEnlaces().catch(console.error);

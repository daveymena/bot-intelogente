/**
 * Test rápido de generación de dataset
 * Genera solo 2 conversaciones para probar que funciona
 */

import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGeneracion() {
  console.log('🧪 Test Rápido de Generación\n');

  try {
    // 1. Verificar conexión a BD
    console.log('1️⃣ Verificando conexión a base de datos...');
    const productCount = await prisma.product.count();
    console.log(`   ✅ Conectado. ${productCount} productos en BD\n`);

    // 2. Obtener productos de prueba
    console.log('2️⃣ Obteniendo productos...');
    const productos = await prisma.product.findMany({
      where: { status: 'AVAILABLE' },
      take: 5
    });
    console.log(`   ✅ ${productos.length} productos obtenidos\n`);

    if (productos.length > 0) {
      console.log('   Productos de ejemplo:');
      productos.forEach(p => {
        console.log(`   - ${p.name}: $${p.price.toLocaleString('es-CO')}`);
      });
      console.log('');
    }

    // 3. Verificar Groq API
    if (process.env.GROQ_API_KEY) {
      console.log('3️⃣ Verificando Groq API...');
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'user', content: 'Di "OK" si funcionas' }
          ],
          model: 'llama-3.3-70b-versatile', // Modelo actualizado
          max_tokens: 10
        });
        console.log(`   ✅ Groq API funcionando\n`);
      } catch (error) {
        console.log(`   ❌ Error en Groq: ${error.message}\n`);
      }
    } else {
      console.log('3️⃣ ⚠️ GROQ_API_KEY no configurada\n');
    }

    // 4. Verificar Ollama
    console.log('4️⃣ Verificando Ollama...');
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Ollama disponible (${data.models?.length || 0} modelos)\n`);
      }
    } catch (error) {
      console.log('   ⚠️ Ollama no disponible\n');
    }

    // 5. Generar 1 conversación de prueba
    console.log('5️⃣ Generando conversación de prueba...\n');

    const prompt = `Genera UNA conversación corta (5-8 mensajes) entre un cliente y un bot de ventas.

PRODUCTOS DISPONIBLES:
${productos.slice(0, 3).map(p => `- ${p.name}: $${p.price.toLocaleString('es-CO')}`).join('\n')}

FORMATO JSON:
{
  "conversation_id": "test_001",
  "messages": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?"},
    ...
  ]
}

Genera SOLO el JSON:`;

    if (process.env.GROQ_API_KEY) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'Eres un generador de conversaciones de ventas.' },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.3-70b-versatile', // Modelo actualizado
          temperature: 0.8,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        });

        const conversacion = JSON.parse(completion.choices[0]?.message?.content || '{}');
        
        console.log('   ✅ Conversación generada:\n');
        console.log(JSON.stringify(conversacion, null, 2));
        console.log('');

      } catch (error) {
        console.log(`   ❌ Error generando: ${error.message}\n`);
      }
    } else {
      console.log('   ⚠️ Saltando generación (no hay Groq API)\n');
    }

    console.log('✅ Test completado!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Si todo funciona, ejecuta: npx tsx scripts/generar-dataset-completo.ts');
    console.log('   2. Esto generará 1,000+ conversaciones (30-60 min)');
    console.log('   3. Los archivos se guardarán en data/training/\n');

  } catch (error) {
    console.error('❌ Error en test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGeneracion();

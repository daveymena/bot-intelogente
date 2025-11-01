import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function mejorarDescripcion(producto: any): Promise<string> {
    const prompt = `Eres un experto en copywriting para e-commerce. Crea una descripción atractiva para este producto usando SOLO la información real proporcionada.

PRODUCTO:
- Nombre: ${producto.name}
- Categoría: ${producto.category}
- Precio: $${producto.price.toLocaleString('es-CO')} COP
${producto.description ? `- Info adicional: ${producto.description}` : ''}

REGLAS ESTRICTAS:
1. USA SOLO información real del producto (NO inventes especificaciones)
2. Aplica AIDA sutilmente: Atención (emoji + título), Interés (características), Deseo (beneficios), Acción (llamado suave)
3. Usa emojis relevantes (máximo 4-5)
4. Usa viñetas (•) para organizar información
5. Máximo 150 palabras
6. Tono profesional pero cercano
7. Enfócate en beneficios reales basados en las características del nombre

FORMATO DESEADO:
[Emoji] Título atractivo corto

[2-3 líneas describiendo el producto y su valor]

✨ Características principales:
• [Característica 1 del nombre]
• [Característica 2 del nombre]
• [Característica 3 del nombre]

💡 Ideal para: [Tipo de usuario basado en el producto]

Responde SOLO con la descripción, sin explicaciones adicionales.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || producto.description || '';
    } catch (error: any) {
        console.error(`❌ Error con Groq:`, error.message);

        // Fallback a OpenRouter si Groq falla
        if (process.env.OPENROUTER_API_KEY) {
            try {
                console.log('🔄 Intentando con OpenRouter...');
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'Tecnovariedades Bot',
                    },
                    body: JSON.stringify({
                        model: 'meta-llama/llama-3.1-70b-instruct',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 500,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    console.error('Respuesta inesperada de OpenRouter:', JSON.stringify(data, null, 2));
                    throw new Error('Formato de respuesta inválido');
                }

                return data.choices[0].message.content || producto.description || '';
            } catch (fallbackError: any) {
                console.error(`❌ Error con OpenRouter:`, fallbackError.message);
            }
        }

        return producto.description || '';
    }
}

async function main() {
    console.log('👀 PREVIEW: Cómo quedarían las descripciones mejoradas\n');
    console.log('⚠️  Este script NO modifica la base de datos, solo muestra ejemplos\n');
    console.log('='.repeat(80) + '\n');

    // Obtener 3 productos de ejemplo
    const productos = await prisma.product.findMany({
        take: 3,
    });

    for (const producto of productos) {
        console.log(`\n📦 PRODUCTO: ${producto.name}`);
        console.log(`💰 Precio: $${producto.price.toLocaleString('es-CO')} COP`);
        console.log(`📁 Categoría: ${producto.category}\n`);

        console.log('📝 DESCRIPCIÓN ACTUAL:');
        console.log(producto.description || '(Sin descripción)');
        console.log('\n' + '─'.repeat(80) + '\n');

        console.log('✨ DESCRIPCIÓN MEJORADA CON IA:');
        const nuevaDescripcion = await mejorarDescripcion(producto);
        console.log(nuevaDescripcion);

        console.log('\n' + '='.repeat(80) + '\n');

        // Esperar 2 segundos entre productos
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Preview completado!');
    console.log('\n💡 Si te gustan los resultados, ejecuta:');
    console.log('   npx tsx scripts/mejorar-descripciones-ia.ts\n');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

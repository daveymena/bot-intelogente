import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { productName, description, price, category } = await request.json();

    const prompt = `Eres un experto en copywriting y marketing digital. Genera contenido persuasivo para una landing page de venta.

Producto: ${productName}
Descripción: ${description}
Precio: $${price.toLocaleString('es-CO')} COP
Categoría: ${category}

Genera el siguiente contenido en formato JSON:
{
  "headline": "Un titular poderoso y atractivo (máximo 10 palabras)",
  "subheadline": "Un subtítulo que explique el valor principal (2-3 líneas)",
  "benefits": ["Beneficio 1 específico", "Beneficio 2 específico", "Beneficio 3 específico"],
  "cta": "Llamado a la acción corto y directo",
  "urgency": "Mensaje de urgencia o escasez",
  "testimonial": "Un testimonio realista de cliente satisfecho"
}

Usa lenguaje persuasivo, enfócate en beneficios (no características), y crea urgencia. Todo en español colombiano.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en copywriting y marketing digital. Respondes SOLO con JSON válido, sin texto adicional.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.8,
      max_tokens: 1000
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Limpiar la respuesta para extraer solo el JSON
    let jsonText = responseText.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const content = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Error generating landing page:', error);
    
    // Fallback: contenido genérico
    return NextResponse.json({
      success: true,
      content: {
        headline: '¡Transforma Tu Vida Hoy!',
        subheadline: 'Descubre cómo este producto puede ayudarte a alcanzar tus metas y mejorar tu día a día.',
        benefits: [
          'Resultados comprobados y garantizados',
          'Fácil de usar, sin complicaciones',
          'Soporte completo incluido'
        ],
        cta: '¡Compra Ahora!',
        urgency: '¡Oferta especial por tiempo limitado!',
        testimonial: 'Este producto cambió mi vida completamente. Lo recomiendo 100%.'
      }
    });
  }
}

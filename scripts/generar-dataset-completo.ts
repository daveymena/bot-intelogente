/**
 * Generador de Dataset Completo para Entrenamiento
 * Usa Groq + Ollama para generar conversaciones realistas
 * Basado en los 8 mega-flujos de Tecnovariedades D&S
 */

import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 8 Mega-flujos base
const MEGA_FLUJOS = {
  tecnologia_contraentrega: {
    nombre: 'Ventas de Tecnología (Contraentrega)',
    intents: ['product_price', 'product_info', 'product_availability', 'product_compare', 'payment_info'],
    variaciones: 50,
    complejidad: 'alta'
  },
  dropshipping: {
    nombre: 'Dropshipping (Tiempos + Garantías)',
    intents: ['order_status', 'product_availability', 'payment_info', 'complaint'],
    variaciones: 40,
    complejidad: 'media'
  },
  servicios_citas: {
    nombre: 'Servicios (Barbería/Estética/Odontología)',
    intents: ['schedule_appointment', 'reschedule_appointment', 'cancel_appointment'],
    variaciones: 30,
    complejidad: 'media'
  },
  soporte_tecnico: {
    nombre: 'Soporte Técnico Real',
    intents: ['complaint', 'help', 'product_info'],
    variaciones: 35,
    complejidad: 'alta'
  },
  productos_digitales: {
    nombre: 'Productos Digitales (Megapacks/Cursos)',
    intents: ['product_info', 'product_price', 'payment_info'],
    variaciones: 45,
    complejidad: 'alta'
  },
  fiados_credito: {
    nombre: 'Fiados / Crédito Semanal',
    intents: ['credit_request', 'credit_payment', 'payment_info'],
    variaciones: 25,
    complejidad: 'baja'
  },
  cliente_agresivo: {
    nombre: 'Cliente Agresivo / Desconfiado',
    intents: ['complaint', 'help', 'product_info'],
    variaciones: 30,
    complejidad: 'muy_alta'
  },
  cliente_indeciso: {
    nombre: 'Cliente Indeciso / Solo Mirando',
    intents: ['product_recommend', 'product_compare', 'product_info'],
    variaciones: 40,
    complejidad: 'alta'
  }
};

/**
 * Prompt maestro para generar conversaciones realistas
 */
function crearPromptGeneracion(flujo: string, productos: any[], variacion: number): string {
  const flujoData = MEGA_FLUJOS[flujo];
  
  return `Eres un experto en generar conversaciones de ventas ULTRA REALISTAS para WhatsApp.

CONTEXTO:
- Empresa: Tecnovariedades D&S (Colombia)
- Flujo: ${flujoData.nombre}
- Variación: ${variacion}/${flujoData.variaciones}

PRODUCTOS REALES DISPONIBLES:
${productos.slice(0, 5).map(p => `- ${p.name}: $${p.price.toLocaleString('es-CO')} (Stock: ${p.stock})`).join('\n')}

INSTRUCCIONES CRÍTICAS:
1. La conversación debe ser LARGA (15-30 mensajes)
2. El cliente debe ser MUY preguntón y desconfiado
3. Incluir TODAS estas objeciones reales:
   - "¿Es nuevo o usado?"
   - "¿Me estafas?"
   - "Vi uno más barato en otro lado"
   - "¿Cuánto demora?"
   - "¿Y si no me gusta?"
   - "¿Tiene garantía?"
   - "¿Puedo verlo antes?"
   - "¿Aceptan contraentrega?"
   - "¿Me das descuento?"
   - "¿Cómo sé que es real?"

4. El bot debe responder con:
   ✅ Emojis naturales
   ✅ Información específica de productos reales
   ✅ Precios exactos
   ✅ Opciones de pago
   ✅ Tiempos de entrega
   ✅ Garantías
   ✅ CTAs claros

5. VARIACIONES por número:
   ${variacion <= 10 ? '- Cliente muy desconfiado' : ''}
   ${variacion > 10 && variacion <= 20 ? '- Cliente preguntón pero interesado' : ''}
   ${variacion > 20 && variacion <= 30 ? '- Cliente comparando precios' : ''}
   ${variacion > 30 && variacion <= 40 ? '- Cliente con presupuesto limitado' : ''}
   ${variacion > 40 ? '- Cliente decidido pero con dudas técnicas' : ''}

6. FORMATO DE SALIDA (JSON):
{
  "conversation_id": "conv_${flujo}_${variacion}",
  "flujo": "${flujo}",
  "outcome": "success",
  "messages": [
    {"role": "user", "content": "mensaje del cliente"},
    {"role": "assistant", "content": "respuesta del bot"},
    ...
  ],
  "metadata": {
    "intents_used": ["intent1", "intent2"],
    "products_mentioned": ["producto1"],
    "objections_handled": ["objecion1"],
    "final_action": "purchase|schedule|pending"
  }
}

GENERA UNA CONVERSACIÓN COMPLETA Y REALISTA:`;
}

/**
 * Genera una conversación usando Groq
 */
async function generarConversacionGroq(
  flujo: string,
  productos: any[],
  variacion: number
): Promise<any> {
  try {
    const prompt = crearPromptGeneracion(flujo, productos, variacion);
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en generar conversaciones de ventas realistas en español colombiano.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile', // Modelo actualizado (Nov 2024)
      temperature: 0.9,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content from Groq');

    return JSON.parse(content);

  } catch (error) {
    console.error(`Error generando con Groq (${flujo} #${variacion}):`, error.message);
    return null;
  }
}

/**
 * Genera conversación usando Ollama (fallback)
 */
async function generarConversacionOllama(
  flujo: string,
  productos: any[],
  variacion: number
): Promise<any> {
  try {
    const prompt = crearPromptGeneracion(flujo, productos, variacion);
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma2:27b',
        prompt,
        stream: false,
        options: {
          temperature: 0.9,
          num_predict: 4000
        }
      })
    });

    const data = await response.json();
    const content = data.response;
    
    // Extraer JSON del texto
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Ollama response');

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error(`Error generando con Ollama (${flujo} #${variacion}):`, error.message);
    return null;
  }
}

/**
 * Enriquece conversación con datos reales de la BD
 */
async function enriquecerConversacion(conversacion: any): Promise<any> {
  // Reemplazar productos genéricos con productos reales
  const productos = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    take: 10
  });

  let conversacionEnriquecida = JSON.stringify(conversacion);

  // Reemplazar precios genéricos
  conversacionEnriquecida = conversacionEnriquecida.replace(
    /\$[\d,\.]+/g,
    () => `$${productos[Math.floor(Math.random() * productos.length)].price.toLocaleString('es-CO')}`
  );

  // Reemplazar nombres de productos
  const productosReales = productos.map(p => p.name);
  conversacionEnriquecida = conversacionEnriquecida.replace(
    /(laptop|portátil|celular|teléfono|smartwatch)/gi,
    () => productosReales[Math.floor(Math.random() * productosReales.length)]
  );

  return JSON.parse(conversacionEnriquecida);
}

/**
 * Valida calidad de la conversación
 */
function validarConversacion(conversacion: any): boolean {
  if (!conversacion || !conversacion.messages) return false;
  
  const messages = conversacion.messages;
  
  // Validaciones
  const checks = {
    longitudMinima: messages.length >= 10,
    tieneUsuario: messages.some(m => m.role === 'user'),
    tieneAsistente: messages.some(m => m.role === 'assistant'),
    tienePrecios: JSON.stringify(messages).includes('$'),
    tieneEmojis: JSON.stringify(messages).match(/[\u{1F300}-\u{1F9FF}]/u),
    noMuyCorta: messages.every(m => m.content.length > 5),
    alternancia: messages[0].role !== messages[1]?.role
  };

  const valida = Object.values(checks).every(v => v);
  
  if (!valida) {
    console.warn('Conversación rechazada:', checks);
  }

  return valida;
}

/**
 * Genera dataset completo para un flujo
 */
async function generarDatasetFlujo(flujo: string): Promise<any[]> {
  console.log(`\n🎯 Generando dataset para: ${MEGA_FLUJOS[flujo].nombre}`);
  
  const productos = await prisma.product.findMany({
    where: { 
      status: 'AVAILABLE' // Productos disponibles
    },
    take: 20
  });

  const conversaciones: any[] = [];
  const variaciones = MEGA_FLUJOS[flujo].variaciones;

  for (let i = 1; i <= variaciones; i++) {
    console.log(`   Variación ${i}/${variaciones}...`);

    // Intentar con Groq primero
    let conversacion = await generarConversacionGroq(flujo, productos, i);

    // Fallback a Ollama si Groq falla
    if (!conversacion) {
      console.log('   ⚠️ Groq falló, usando Ollama...');
      conversacion = await generarConversacionOllama(flujo, productos, i);
    }

    if (!conversacion) {
      console.log('   ❌ Ambos fallaron, saltando...');
      continue;
    }

    // Enriquecer con datos reales
    conversacion = await enriquecerConversacion(conversacion);

    // Validar calidad
    if (!validarConversacion(conversacion)) {
      console.log('   ⚠️ Conversación no válida, saltando...');
      continue;
    }

    conversaciones.push(conversacion);
    console.log(`   ✅ Conversación ${i} generada`);

    // Delay para no saturar APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ ${conversaciones.length}/${variaciones} conversaciones generadas para ${flujo}`);
  
  return conversaciones;
}

/**
 * Genera dataset completo para todos los flujos
 */
async function generarDatasetCompleto(): Promise<void> {
  console.log('🚀 Iniciando generación de dataset completo...\n');
  console.log('⚠️ MODO SIN DOCKER - Solo generación de dataset\n');

  const datasetCompleto: any = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_flujos: Object.keys(MEGA_FLUJOS).length,
      total_conversaciones: 0,
      version: '1.0.0',
      modo: 'sin_docker'
    },
    flujos: {}
  };

  // Generar para cada flujo
  for (const [flujoKey, flujoData] of Object.entries(MEGA_FLUJOS)) {
    const conversaciones = await generarDatasetFlujo(flujoKey);
    
    datasetCompleto.flujos[flujoKey] = {
      nombre: flujoData.nombre,
      conversaciones,
      total: conversaciones.length
    };

    datasetCompleto.metadata.total_conversaciones += conversaciones.length;
  }

  // Guardar dataset
  const outputDir = path.join(process.cwd(), 'data', 'training');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `dataset_completo_${Date.now()}.json`);
  await fs.writeFile(outputPath, JSON.stringify(datasetCompleto, null, 2));

  console.log(`\n🎉 Dataset completo generado!`);
  console.log(`📊 Estadísticas:`);
  console.log(`   - Total flujos: ${datasetCompleto.metadata.total_flujos}`);
  console.log(`   - Total conversaciones: ${datasetCompleto.metadata.total_conversaciones}`);
  console.log(`   - Archivo: ${outputPath}`);

  // Generar también formato para entrenamiento
  await generarFormatosEntrenamiento(datasetCompleto, outputDir);
  
  console.log('\n📝 NOTA: Dataset generado sin Docker');
  console.log('   Puedes usar este dataset con:');
  console.log('   - Tu sistema actual de Ollama');
  console.log('   - Groq API');
  console.log('   - Cualquier otro LLM');
  console.log('   - Para entrenar modelos custom');
}

/**
 * Genera formatos específicos para entrenamiento
 */
async function generarFormatosEntrenamiento(dataset: any, outputDir: string): Promise<void> {
  console.log('\n📝 Generando formatos de entrenamiento...');

  // 1. Formato fastText (para intent classifier)
  const fastTextData: string[] = [];
  
  for (const flujo of Object.values(dataset.flujos) as any[]) {
    for (const conv of flujo.conversaciones) {
      for (const msg of conv.messages) {
        if (msg.role === 'user' && conv.metadata?.intents_used) {
          const intent = conv.metadata.intents_used[0];
          fastTextData.push(`__label__${intent} ${msg.content}`);
        }
      }
    }
  }

  await fs.writeFile(
    path.join(outputDir, 'intent_training.txt'),
    fastTextData.join('\n')
  );
  console.log(`   ✅ intent_training.txt (${fastTextData.length} ejemplos)`);

  // 2. Formato JSONL (para embeddings)
  const jsonlData: string[] = [];
  
  for (const flujo of Object.values(dataset.flujos) as any[]) {
    for (const conv of flujo.conversaciones) {
      jsonlData.push(JSON.stringify({
        id: conv.conversation_id,
        messages: conv.messages,
        metadata: conv.metadata
      }));
    }
  }

  await fs.writeFile(
    path.join(outputDir, 'conversations.jsonl'),
    jsonlData.join('\n')
  );
  console.log(`   ✅ conversations.jsonl (${jsonlData.length} conversaciones)`);

  // 3. Formato para Qdrant (documentos)
  const qdrantDocs: any[] = [];
  
  for (const flujo of Object.values(dataset.flujos) as any[]) {
    for (const conv of flujo.conversaciones) {
      // Crear documento por cada par pregunta-respuesta
      for (let i = 0; i < conv.messages.length - 1; i++) {
        if (conv.messages[i].role === 'user' && conv.messages[i + 1].role === 'assistant') {
          qdrantDocs.push({
            id: `${conv.conversation_id}_${i}`,
            text: `Q: ${conv.messages[i].content}\nA: ${conv.messages[i + 1].content}`,
            metadata: {
              flujo: conv.flujo,
              conversation_id: conv.conversation_id,
              ...conv.metadata
            }
          });
        }
      }
    }
  }

  await fs.writeFile(
    path.join(outputDir, 'qdrant_documents.json'),
    JSON.stringify(qdrantDocs, null, 2)
  );
  console.log(`   ✅ qdrant_documents.json (${qdrantDocs.length} documentos)`);

  console.log('\n✅ Todos los formatos generados!');
}

/**
 * Main
 */
async function main() {
  try {
    await generarDatasetCompleto();
    console.log('\n🎉 Proceso completado exitosamente!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

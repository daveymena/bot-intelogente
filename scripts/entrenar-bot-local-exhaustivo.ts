/**
 * 🎓 SCRIPT DE ENTRENAMIENTO EXHAUSTIVO
 * 
 * Este script usa Groq y Ollama para generar miles de conversaciones
 * y entrenar al bot local para que funcione sin IA externa.
 * 
 * Uso:
 * npm run train:exhaustive
 */

import { PrismaClient } from '@prisma/client';
import { HybridLearningSystem } from '../src/lib/hybrid-learning-system';
import { GroqService } from '../src/lib/groq-service';
import { OllamaService } from '../src/lib/ollama-service';

const prisma = new PrismaClient();

// Escenarios de conversación a generar
const TRAINING_SCENARIOS = [
  // Ventas
  { type: 'greeting', count: 100, description: 'Saludos iniciales' },
  { type: 'product_search', count: 500, description: 'Búsqueda de productos' },
  { type: 'price_inquiry', count: 300, description: 'Preguntas sobre precios' },
  { type: 'photo_request', count: 200, description: 'Solicitud de fotos' },
  { type: 'product_details', count: 300, description: 'Detalles de productos' },
  { type: 'availability', count: 200, description: 'Disponibilidad y stock' },
  { type: 'payment_method', count: 250, description: 'Métodos de pago' },
  { type: 'purchase_intent', count: 200, description: 'Intención de compra' },
  { type: 'shipping', count: 150, description: 'Envíos y entregas' },
  
  // Objeciones
  { type: 'price_objection', count: 150, description: 'Objeciones de precio' },
  { type: 'quality_concern', count: 100, description: 'Dudas de calidad' },
  { type: 'comparison', count: 100, description: 'Comparaciones' },
  
  // Soporte
  { type: 'general_inquiry', count: 200, description: 'Consultas generales' },
  { type: 'farewell', count: 100, description: 'Despedidas' },
];

async function generateTrainingData() {
  console.log('🎓 INICIANDO ENTRENAMIENTO EXHAUSTIVO\n');
  console.log('═'.repeat(60));
  
  let totalGenerated = 0;
  let totalLearned = 0;
  
  // Obtener productos para contexto
  const products = await prisma.product.findMany({
    where: { status: 'AVAILABLE' },
    take: 50 // Primeros 50 productos
  });
  
  console.log(`\n📦 Productos disponibles: ${products.length}`);
  console.log('🤖 Generando conversaciones con Groq/Ollama...\n');
  
  for (const scenario of TRAINING_SCENARIOS) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📝 Escenario: ${scenario.description}`);
    console.log(`🎯 Objetivo: ${scenario.count} conversaciones`);
    console.log(`${'─'.repeat(60)}\n`);
    
    for (let i = 0; i < scenario.count; i++) {
      try {
        // Seleccionar producto aleatorio
        const product = products[Math.floor(Math.random() * products.length)];
        
        // Generar pregunta del usuario usando Groq
        const userQuery = await generateUserQuery(scenario.type, product);
        
        if (!userQuery) continue;
        
        // Procesar con sistema híbrido (esto generará la respuesta con IA y la guardará)
        const response = await HybridLearningSystem.processWithLearning({
          message: userQuery,
          context: {
            currentProduct: product,
            messages: []
          },
          productId: product.id
        });
        
        if (response.learned) {
          totalLearned++;
        }
        
        totalGenerated++;
        
        // Mostrar progreso cada 10 conversaciones
        if ((i + 1) % 10 === 0) {
          console.log(`  ✅ Progreso: ${i + 1}/${scenario.count} (${totalLearned} aprendidas)`);
        }
        
        // Pequeña pausa para no saturar las APIs
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Error en conversación ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n✅ Escenario completado: ${scenario.description}`);
  }
  
  // Resumen final
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('📊 RESUMEN DEL ENTRENAMIENTO');
  console.log('═'.repeat(60));
  console.log(`\n✅ Conversaciones generadas: ${totalGenerated}`);
  console.log(`🧠 Patrones aprendidos: ${totalLearned}`);
  
  // Estadísticas de la base de conocimiento
  const stats = await HybridLearningSystem.getLearningStats();
  console.log(`\n📚 Base de Conocimiento:`);
  console.log(`   Total de entradas: ${stats.totalKnowledge}`);
  console.log(`   Patrones únicos: ${stats.totalPatterns}`);
  console.log(`   Confianza promedio: ${(stats.avgConfidence * 100).toFixed(1)}%`);
  console.log(`   Aprendizaje reciente: ${stats.learningRate}`);
  
  console.log('\n✅ ENTRENAMIENTO COMPLETADO\n');
  console.log('El bot ahora puede funcionar sin IA externa en la mayoría de casos.\n');
}

/**
 * Genera una pregunta de usuario realista usando Groq
 */
async function generateUserQuery(scenarioType: string, product: any): Promise<string | null> {
  const prompts: Record<string, string> = {
    greeting: `Genera un saludo corto y natural de un cliente en español (máximo 10 palabras). Ejemplos: "Hola", "Buenos días", "Hola, cómo estás"`,
    
    product_search: `Genera una pregunta de un cliente buscando el producto "${product.name}" de forma natural. Varía el estilo: directo, con contexto, con presupuesto, etc. Solo la pregunta, sin respuesta.`,
    
    price_inquiry: `Genera una pregunta sobre el precio del producto "${product.name}". Varía: "cuánto cuesta", "qué precio tiene", "cuál es el valor", etc.`,
    
    photo_request: `Genera una solicitud de foto del producto "${product.name}". Varía: "tienes foto", "muéstrame", "cómo se ve", etc.`,
    
    product_details: `Genera una pregunta sobre características del producto "${product.name}". Pregunta por especificaciones, detalles, qué incluye, etc.`,
    
    availability: `Genera una pregunta sobre disponibilidad del producto "${product.name}". Varía: "tienes en stock", "hay disponible", "cuándo llega", etc.`,
    
    payment_method: `Genera una pregunta sobre métodos de pago. Varía: "cómo puedo pagar", "aceptan nequi", "formas de pago", etc.`,
    
    purchase_intent: `Genera una expresión de intención de compra del producto "${product.name}". Varía: "lo quiero", "me interesa", "cómo lo compro", etc.`,
    
    shipping: `Genera una pregunta sobre envío. Varía: "hacen envíos", "cuánto demora", "envían a mi ciudad", etc.`,
    
    price_objection: `Genera una objeción de precio sobre "${product.name}". Varía: "está muy caro", "hay más económico", "descuento", etc.`,
    
    quality_concern: `Genera una duda sobre calidad. Varía: "es original", "tiene garantía", "es bueno", etc.`,
    
    comparison: `Genera una pregunta comparando productos. Menciona "${product.name}" y pregunta por alternativas.`,
    
    general_inquiry: `Genera una pregunta general sobre el negocio. Varía: "horarios", "ubicación", "contacto", etc.`,
    
    farewell: `Genera una despedida corta. Varía: "gracias", "ok perfecto", "hasta luego", etc.`
  };
  
  const prompt = prompts[scenarioType] || prompts.general_inquiry;
  
  try {
    const response = await GroqService.generateResponse({
      systemPrompt: 'Eres un cliente colombiano buscando productos. Genera solo la pregunta, sin contexto adicional. Máximo 20 palabras.',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response?.text?.trim() || null;
  } catch (error) {
    // Si Groq falla, intentar con Ollama
    try {
      const response = await OllamaService.generateResponse({
        systemPrompt: 'Genera solo la pregunta del cliente, sin contexto. Máximo 20 palabras.',
        messages: [{ role: 'user', content: prompt }]
      });
      
      return response?.text?.trim() || null;
    } catch {
      return null;
    }
  }
}

// Ejecutar entrenamiento
generateTrainingData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

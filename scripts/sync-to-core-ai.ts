/**
 * Script para sincronizar datos del proyecto actual con Core AI
 * Sincroniza: productos, conversaciones, conocimiento
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const CORE_AI_URL = process.env.CORE_AI_URL || 'http://localhost:8000';

interface Document {
  id: string;
  text: string;
  metadata: Record<string, any>;
}

/**
 * Sincroniza productos activos
 */
async function syncProducts() {
  console.log('\n📦 Sincronizando productos...');

  try {
    const products = await prisma.product.findMany({
      where: { 
        status: 'AVAILABLE' // Productos disponibles
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`   Encontrados: ${products.length} productos`);

    const documents: Document[] = products.map(p => {
      // Construir texto descriptivo
      let text = `${p.name}.`;
      
      if (p.description) {
        text += ` ${p.description}.`;
      }
      
      text += ` Precio: $${p.price.toLocaleString('es-CO')}.`;
      
      if (p.stock !== null && p.stock !== undefined) {
        text += ` Stock: ${p.stock} unidades.`;
      }
      
      if (p.category) {
        text += ` Categoría: ${p.category}.`;
      }

      return {
        id: `prod_${p.id}`,
        text,
        metadata: {
          product_id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          tags: p.tags || [],
          type: p.category || 'PHYSICAL',
          status: p.status,
          created_at: p.createdAt.toISOString()
        }
      };
    });

    // Enviar a Core AI en batches
    const batchSize = 100;
    let synced = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      await axios.post(`${CORE_AI_URL}/index/products`, {
        documents: batch
      });

      synced += batch.length;
      console.log(`   Sincronizados: ${synced}/${documents.length}`);
    }

    console.log(`   ✅ ${documents.length} productos sincronizados`);

  } catch (error) {
    console.error('   ❌ Error sincronizando productos:', error.message);
    throw error;
  }
}

/**
 * Sincroniza conversaciones exitosas para entrenamiento
 */
async function syncConversations() {
  console.log('\n💬 Sincronizando conversaciones...');

  try {
    // Obtener conversaciones exitosas de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const conversations = await prisma.conversation.findMany({
      where: {
        outcome: 'success',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      take: 1000 // Limitar a 1000 conversaciones
    });

    console.log(`   Encontradas: ${conversations.length} conversaciones exitosas`);

    let synced = 0;

    for (const conv of conversations) {
      try {
        // Formatear mensajes
        const messages = conv.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

        // Enviar para entrenamiento
        await axios.post(`${CORE_AI_URL}/train`, {
          conversation_id: conv.id,
          messages,
          outcome: conv.outcome,
          feedback: conv.feedback || undefined
        });

        synced++;

        if (synced % 10 === 0) {
          console.log(`   Sincronizadas: ${synced}/${conversations.length}`);
        }

      } catch (error) {
        console.warn(`   ⚠️ Error en conversación ${conv.id}:`, error.message);
      }
    }

    console.log(`   ✅ ${synced} conversaciones sincronizadas`);

  } catch (error) {
    console.error('   ❌ Error sincronizando conversaciones:', error.message);
    throw error;
  }
}

/**
 * Sincroniza base de conocimiento (FAQs, procedimientos)
 */
async function syncKnowledgeBase() {
  console.log('\n📚 Sincronizando base de conocimiento...');

  try {
    // Obtener entradas de conocimiento (usar ConversationKnowledge)
    let knowledgeEntries = [];
    try {
      knowledgeEntries = await prisma.conversationKnowledge.findMany({
        where: { 
          confidence: { gte: 0.7 } // Solo conocimiento con buena confianza
        },
        orderBy: { successRate: 'desc' },
        take: 100
      });
    } catch (error) {
      // Tabla no existe o está vacía, continuar sin error
      console.log('   ℹ️ No hay conocimiento previo, saltando...');
      return;
    }

    console.log(`   Encontradas: ${knowledgeEntries.length} entradas`);

    const documents: Document[] = knowledgeEntries.map(k => ({
      id: `kb_${k.id}`,
      text: `Q: ${k.userQuery}\nA: ${k.botResponse}`,
      metadata: {
        kb_id: k.id,
        context: k.context,
        product_id: k.productId,
        product_name: k.productName,
        confidence: k.confidence,
        success_rate: k.successRate,
        usage_count: k.usageCount,
        created_at: k.createdAt.toISOString()
      }
    }));

    // Enviar a Core AI
    if (documents.length > 0) {
      await axios.post(`${CORE_AI_URL}/index/knowledge_base`, {
        documents
      });

      console.log(`   ✅ ${documents.length} entradas sincronizadas`);
    } else {
      console.log('   ℹ️ No hay entradas para sincronizar');
    }

  } catch (error) {
    // Si la tabla no existe, no es crítico
    if (error.code === 'P2021') {
      console.log('   ℹ️ Tabla knowledgeBase no existe, saltando...');
    } else {
      console.error('   ❌ Error sincronizando KB:', error.message);
    }
  }
}

/**
 * Verifica salud de Core AI
 */
async function checkCoreAIHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${CORE_AI_URL}/health`, {
      timeout: 5000
    });

    const isHealthy = response.data.status === 'healthy';
    
    if (isHealthy) {
      console.log('✅ Core AI está saludable');
    } else {
      console.warn('⚠️ Core AI está degradado');
    }

    return isHealthy;

  } catch (error) {
    console.error('❌ Core AI no está disponible:', error.message);
    return false;
  }
}

/**
 * Trigger re-indexación en Core AI
 */
async function triggerReindex() {
  console.log('\n🔄 Triggering re-indexación en Core AI...');

  try {
    await axios.post(`${CORE_AI_URL}/reindex`);
    console.log('   ✅ Re-indexación iniciada');
  } catch (error) {
    console.error('   ❌ Error triggering reindex:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Iniciando sincronización con Core AI');
  console.log(`   URL: ${CORE_AI_URL}`);

  try {
    // 1. Verificar salud de Core AI
    const isHealthy = await checkCoreAIHealth();
    if (!isHealthy) {
      console.error('\n❌ Core AI no está disponible. Abortando sincronización.');
      process.exit(1);
    }

    // 2. Sincronizar productos
    await syncProducts();

    // 3. Sincronizar conversaciones
    await syncConversations();

    // 4. Sincronizar base de conocimiento
    await syncKnowledgeBase();

    // 5. Trigger re-indexación
    await triggerReindex();

    console.log('\n🎉 Sincronización completada exitosamente!');
    console.log('\n📊 Próximos pasos:');
    console.log('   1. Verificar logs de Core AI: docker-compose logs -f core-ai');
    console.log('   2. Probar query: curl -X POST http://localhost:8000/query -d \'{"user_id":"test","text":"Hola"}\'');
    console.log('   3. Ver stats: curl http://localhost:8000/stats');

  } catch (error) {
    console.error('\n❌ Error en sincronización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
main();

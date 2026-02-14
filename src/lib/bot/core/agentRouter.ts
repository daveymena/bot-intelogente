// src/lib/bot/core/agentRouter.ts
import { classifyIntent, IntentResult } from './intentClassifier';
import { handleSalesIntent } from '../agents/salesAgent';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// 🦞 IMPORTAR OPENCLAW
let openClawInstance: any = null;

// Cargar OpenClaw dinámicamente
async function getOpenClaw() {
  if (!openClawInstance) {
    const module = await import('../openclaw-orchestrator');
    openClawInstance = module.openClawOrchestrator; // Usar singleton exportado
  }
  return openClawInstance;
}

/**
 * Router Principal del Sistema Multi-Agente
 * Recibe mensajes, clasifica intención y enruta al agente correcto
 */
export interface AgentResponse {
  text: string;
  media?: string[];
}

/**
 * Router Principal del Sistema Multi-Agente
 * Recibe mensajes, clasifica intención y enruta al agente correcto
 */
export async function routeMessage(
  userId: string,
  customerPhone: string,
  message: string,
  options?: { 
    conversationId?: string;
    hasImage?: boolean;
    isAdmin?: boolean;
  }
): Promise<AgentResponse> {
  try {
    console.log(`[AgentRouter] 🦞 Procesando con OpenClaw para ${customerPhone}`);
    fs.appendFileSync('debug_router.log', `[${new Date().toISOString()}] MSG: ${customerPhone} -> ${message}\n`);
    
    // 0. LÓGICA DE ADMINISTRADOR (Escalación de compra)
    if (customerPhone.includes('3136174267')) {
      const msg = message.toLowerCase();
      if (msg.includes('aprobar') || msg.includes('confirma') || msg.includes('envía') || msg.includes('envia')) {
        console.log(`[AgentRouter] 👨‍💼 Administrador aprobando pago...`);
        // Buscar conversación más reciente que esté en validación
        const pendingConv = await prisma.conversation.findFirst({
          where: { status: 'ACTIVE', currentStage: 'pago_validando' },
          orderBy: { lastMessageAt: 'desc' }
        });

        if (pendingConv) {
          console.log(`[AgentRouter] ✅ Pago aprobado para ${pendingConv.customerPhone}`);
          await prisma.conversation.update({
            where: { id: pendingConv.id },
            data: { currentStage: 'confirmacion', needsHumanAttention: false }
          });
          return {
            text: `¡Hola! He validado tu pago con éxito. 🎉 David ya tiene la orden para proceder. ¿Me confirmas tu nombre completo y dirección para el envío?`
          };
        }
      }
    }

    // 1. Guardar mensaje entrante
    let conversation = options?.conversationId
      ? await prisma.conversation.findUnique({ where: { id: options.conversationId }, include: { product: true } })
      : await prisma.conversation.findFirst({
          where: { customerPhone, userId, status: 'ACTIVE' },
          include: { product: true }
        });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerPhone,
          userId,
          status: 'ACTIVE',
          lastMessageAt: new Date()
        },
        include: { product: true }
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        type: 'TEXT',
        direction: 'INCOMING'
      }
    });

    // 2. 🦞 USAR OPENCLAW en lugar del sistema antiguo
    try {
      const openClaw = await getOpenClaw();
      
      // 🚀 OBTENER PRODUCTOS (Prioridad: Supabase -> Fallback: Prisma)
      let products = [];
      try {
        const { SupabaseProductService } = await import('../openclaw-supabase-products');
        products = await SupabaseProductService.getAvailableProducts(userId);
        
        if (products.length > 0) {
          console.log(`[AgentRouter] ✅ ${products.length} productos cargados desde SUPABASE (Profesional)`);
        } else {
          console.log(`[AgentRouter] ⚠️ Supabase no devolvió productos, usando PRISMA como fallback`);
          products = await prisma.product.findMany({
            where: { userId, status: 'AVAILABLE' }
          });
        }
      } catch (e) {
        console.error(`[AgentRouter] ❌ Error cargando productos desde Supabase:`, e);
        products = await prisma.product.findMany({
          where: { userId, status: 'AVAILABLE' }
        });
      }

      // Contexto para OpenClaw
      const context = {
        userId,
        products,
        conversationId: conversation.id,
        currentStage: conversation.currentStage,
        activeProduct: (conversation as any).product
      };

      // Procesar con OpenClaw
      const openClawResponse = await openClaw.processMessage(message, customerPhone, context, options?.hasImage);

      // Si pasa a validación, marcar para atención humana (Admin verá esto)
      if (openClawResponse.nextStage === 'pago_validando') {
        console.log(`[AgentRouter] 🚨 Escalando a admin para validación de pago: ${customerPhone}`);
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { needsHumanAttention: true, escalationReason: 'Validación de pago requerida' }
        });
      }
      
      console.log(`[AgentRouter] ✅ OpenClaw respondió (Estado: ${openClawResponse.nextStage})`);

      // Guardar respuesta en DB
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: openClawResponse.text,
          type: 'TEXT',
          direction: 'OUTGOING',
          aiGenerated: true
        }
      });

      // Actualizar conversación (Estado y Producto Activo)
      const updateData: any = { 
        lastMessageAt: new Date(),
        currentStage: openClawResponse.nextStage
      };

      // Si OpenClaw devolvió un producto específico (toolData), actualizar el productId
      if (openClawResponse.isSpecific && openClawResponse.media) {
         // Intentar extraer el ID del producto si es posible o confiar en que el estado ya cambió
      }

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: updateData
      });

      return {
        text: openClawResponse.text,
        media: openClawResponse.media || undefined
      };

    } catch (openClawError: any) {
      console.error('[AgentRouter] ❌ Error en OpenClaw Orchestrator:', openClawError.message);
      
      // FALLBACK SIMPLE: No usar sitemas complejos que fallan
      return { 
        text: 'David: Hola! Tuve un inconveniente al procesar tu mensaje. ¿Podrías repetirme qué estás buscando? 😊' 
      };
    }

  } catch (error) {
    console.error('[AgentRouter] Error:', error);
    return { text: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?' };
  }
}

/**
 * Seleccionar y ejecutar el agente apropiado según la intención
 */
async function selectAndExecuteAgent(
  userId: string,
  customerPhone: string,
  message: string,
  intentData: IntentResult,
  conversationId: string
): Promise<AgentResponse> {
  
  // Mapeo de intenciones a agentes
  const intentToAgent: Record<string, string> = {
    'saludo': 'sales',
    'consulta_precio': 'sales',
    'consulta_disponibilidad': 'sales',
    'comparacion': 'technical',
    'compra': 'sales',
    'soporte': 'support',
    'informacion_envio': 'sales',
    'informacion_pago': 'sales',
    'despedida': 'sales',
    'otro': 'sales' // Por defecto, sales
  };

  const agentType = intentToAgent[intentData.intent] || 'sales';
  console.log(`[AgentRouter] Enrutando a agente: ${agentType}`);

  // Ejecutar agente correspondiente
  switch (agentType) {
    case 'sales':
      return await handleSalesIntent(userId, customerPhone, message, intentData, conversationId);
    
    case 'technical':
      // TODO: Implementar agente técnico
      return await handleSalesIntent(userId, customerPhone, message, intentData, conversationId);
    
    case 'support':
      // TODO: Implementar agente de soporte
      return { text: await handleSupportIntent(userId, customerPhone, message, intentData, conversationId) };
    
    default:
      return await handleSalesIntent(userId, customerPhone, message, intentData, conversationId);
  }
}

/**
 * Agente de Soporte (básico)
 */
async function handleSupportIntent(
  userId: string,
  customerPhone: string,
  message: string,
  intentData: IntentResult,
  conversationId: string
): Promise<string> {
  // Por ahora, respuesta básica
  // TODO: Implementar lógica completa de soporte
  
  const response = `Entiendo que necesitas ayuda. Un miembro de nuestro equipo te contactará pronto para resolver tu situación. 

¿Podrías darme más detalles sobre el problema?`;

  await prisma.message.create({
    data: {
      conversationId,
      content: response,
      type: 'TEXT',
      direction: 'OUTGOING',
      aiGenerated: true,
      confidence: intentData.confidence
    }
  });

  return response;
}

/**
 * Obtener estadísticas del router
 */
export async function getRouterStats(userId: string, days: number = 7): Promise<any> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      lastMessageAt: { gte: since }
    },
    include: {
      messages: true
    }
  });

  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  const avgMessagesPerConv = totalMessages / totalConversations || 0;

  return {
    totalConversations,
    totalMessages,
    avgMessagesPerConversation: avgMessagesPerConv.toFixed(2),
    period: `${days} días`
  };
}

/**
 * 🔌 API Refactorizada - Endpoints principales del bot
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSalesFlowManager, SalesFlowManager } from '@/lib/bot/sales-flow-manager';
import { createConversationalEngine } from '@/lib/bot/conversational-engine';

// Instancias globales
let salesManager: SalesFlowManager;

/**
 * Inicializa el gestor de ventas
 */
function initSalesManager() {
  if (!salesManager) {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY no está configurada');
    }
    salesManager = createSalesFlowManager(groqApiKey);
  }
  return salesManager;
}

/**
 * POST /api/bot/message
 * Procesa un mensaje del cliente
 */
export async function POST(request: NextRequest) {
  try {
    const { opportunityId, message, customer } = await request.json();

    const manager = initSalesManager();

    let result;

    if (!opportunityId) {
      // Nueva conversación
      result = await manager.initiateSale(customer, message);
    } else {
      // Conversación continua
      result = await manager.continueConversation(opportunityId, message);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bot/close
 * Cierra una venta
 */
export async function closeSale(request: NextRequest) {
  try {
    const { opportunityId, products } = await request.json();

    const manager = initSalesManager();
    const result = await manager.closeSale(opportunityId, products);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error cerrando venta:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bot/opportunity/:opportunityId
 * Obtiene estado de una oportunidad
 */
export async function getOpportunity(opportunityId: string) {
  try {
    const manager = initSalesManager();
    const opportunity = manager.getOpportunity(opportunityId);

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Oportunidad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(opportunity, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo oportunidad:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bot/products
 * Registra productos en el catálogo
 */
export async function addProducts(request: NextRequest) {
  try {
    const { products } = await request.json();

    const manager = initSalesManager();

    products.forEach((product: any) => {
      manager.addProduct(product);
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `${products.length} producto(s) agregado(s)` 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error agregando productos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

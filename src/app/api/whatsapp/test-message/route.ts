/**
 * API Route para testing del bot sin WhatsApp real
 * Permite probar conversaciones directamente
 */

import { NextRequest, NextResponse } from 'next/server';
import { procesarMensaje } from '@/conversational-module/ai/conversacionController';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, message } = body;

    if (!from || !message) {
      return NextResponse.json(
        { error: 'Faltan parámetros: from y message son requeridos' },
        { status: 400 }
      );
    }

    console.log(`[TestAPI] 📨 Mensaje de ${from}: ${message}`);

    // Procesar mensaje usando el controlador de conversación
    const resultado = await procesarMensaje(from, message, {
      botUserId: process.env.DEFAULT_USER_ID || 'test-user'
    });

    console.log(`[TestAPI] ✅ Respuesta generada`);
    console.log(`[TestAPI] 📸 Fotos: ${resultado.fotos?.length || 0}`);

    return NextResponse.json({
      success: true,
      response: resultado.texto,
      photos: resultado.fotos || [],
      hasPhotos: (resultado.fotos?.length || 0) > 0
    });

  } catch (error) {
    console.error('[TestAPI] ❌ Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error procesando mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Permitir GET para verificar que la ruta existe
export async function GET() {
  return NextResponse.json({
    message: 'API de test de WhatsApp activa',
    endpoint: '/api/whatsapp/test-message',
    method: 'POST',
    body: {
      from: 'string (número de teléfono)',
      message: 'string (mensaje del usuario)'
    }
  });
}

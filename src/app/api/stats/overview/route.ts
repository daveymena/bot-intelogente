import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Obtener token de autenticación desde las cookies (igual que /api/auth/me)
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('🔍 Stats API - Verificando autenticación...');
    console.log('Auth token:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.log('❌ No hay token de autenticación');
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Usar el mismo método que /api/auth/me
    const user = await AuthService.getUserFromToken(token);
    
    if (!user) {
      console.log('❌ Token inválido o usuario no encontrado');
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    console.log('✅ Usuario autenticado:', user.email);

    // Obtener estadísticas reales de la base de datos
    const [
      totalConversations,
      totalProducts,
      totalCustomers,
      whatsappConnection,
      totalMessages,
      activeConversations
    ] = await Promise.all([
      // Total de conversaciones
      prisma.conversation.count({
        where: { userId: user.id }
      }),
      
      // Total de productos
      prisma.product.count({
        where: { userId: user.id }
      }),
      
      // Total de clientes únicos (por teléfono)
      prisma.conversation.groupBy({
        by: ['customerPhone'],
        where: { userId: user.id }
      }).then(groups => groups.length),
      
      // Estado de conexión de WhatsApp
      prisma.whatsAppConnection.findUnique({
        where: { userId: user.id }
      }),
      
      // Total de mensajes
      prisma.message.count({
        where: {
          conversation: {
            userId: user.id
          }
        }
      }),
      
      // Conversaciones activas (últimas 24 horas)
      prisma.conversation.count({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          lastMessageAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const stats = {
      totalConversations,
      totalProducts,
      totalCustomers,
      totalMessages,
      activeConversations,
      botStatus: whatsappConnection?.status || 'DISCONNECTED',
      isConnected: whatsappConnection?.isConnected || false,
      lastConnectedAt: whatsappConnection?.lastConnectedAt,
      phoneNumber: whatsappConnection?.phoneNumber
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al obtener estadísticas' 
      },
      { status: 500 }
    );
  }
}

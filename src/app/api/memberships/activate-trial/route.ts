import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya usó la prueba
    if (user.trialEnds) {
      return NextResponse.json(
        { error: 'Ya has usado tu prueba gratuita' },
        { status: 400 }
      );
    }

    // Activar prueba de 10 días
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        membershipType: 'TRIAL',
        trialEnds: trialEnd,
        membershipEnds: trialEnd,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Prueba gratuita activada',
      trialEnds: trialEnd,
    });

  } catch (error: any) {
    console.error('Error activating trial:', error);
    return NextResponse.json(
      { error: error.message || 'Error al activar prueba' },
      { status: 500 }
    );
  }
}

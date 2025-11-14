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

    const body = await request.json();
    const { planId, paymentId, paymentMethod } = body;

    if (!planId || !paymentId) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
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

    // Determinar duración según el plan
    const planDurations: Record<string, { days: number; type: string }> = {
      monthly: { days: 30, type: 'BASIC' },
      quarterly: { days: 90, type: 'PROFESSIONAL' },
      annual: { days: 365, type: 'ENTERPRISE' },
    };

    const planConfig = planDurations[planId];
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Plan no válido' },
        { status: 400 }
      );
    }

    // Calcular fecha de expiración
    const membershipEnd = new Date();
    membershipEnd.setDate(membershipEnd.getDate() + planConfig.days);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        membershipType: planConfig.type as any,
        membershipEnds: membershipEnd,
      }
    });

    // Registrar pago
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: getPlanPrice(planId),
        currency: 'COP',
        status: 'COMPLETED',
        paymentMethod: paymentMethod,
        description: `Membresía ${planId}`,
        metadata: JSON.stringify({
          planId,
          paymentId,
          activatedAt: new Date(),
        }),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Membresía activada',
      membershipEnds: membershipEnd,
      membershipType: planConfig.type,
    });

  } catch (error: any) {
    console.error('Error activating membership:', error);
    return NextResponse.json(
      { error: error.message || 'Error al activar membresía' },
      { status: 500 }
    );
  }
}

function getPlanPrice(planId: string): number {
  const prices: Record<string, number> = {
    monthly: 30000,
    quarterly: 80000,
    annual: 240000,
  };
  return prices[planId] || 0;
}

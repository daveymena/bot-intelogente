import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        membershipType: true,
        membershipEnds: true,
        trialEnds: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const now = new Date();
    const endsAt = user.membershipEnds || user.trialEnds;
    const isActive = endsAt ? endsAt > now : false;
    
    let daysRemaining: number | null = null;
    if (endsAt) {
      const diff = endsAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      type: user.membershipType,
      endsAt: endsAt?.toISOString() || null,
      isActive,
      daysRemaining,
    });

  } catch (error: any) {
    console.error('Error fetching membership status:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estado' },
      { status: 500 }
    );
  }
}

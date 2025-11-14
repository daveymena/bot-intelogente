import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verificar token de admin
    const { adminToken } = await request.json();
    
    if (adminToken !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🔍 Iniciando limpieza de usuarios...');

    // Listar todos los usuarios
    const todosLosUsuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    console.log(`📊 Total de usuarios: ${todosLosUsuarios.length}`);

    // Filtrar usuarios a eliminar (todos excepto daveymena16@gmail.com)
    const usuariosAEliminar = todosLosUsuarios.filter(
      (user) => user.email !== 'daveymena16@gmail.com'
    );

    if (usuariosAEliminar.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay usuarios para eliminar',
        usuarioProtegido: 'daveymena16@gmail.com',
      });
    }

    console.log(`🗑️  Eliminando ${usuariosAEliminar.length} usuario(s)...`);

    const eliminados = [];

    // Eliminar usuarios y sus relaciones
    for (const user of usuariosAEliminar) {
      console.log(`Eliminando: ${user.email}...`);

      // Eliminar relaciones
      await prisma.conversation.deleteMany({ where: { userId: user.id } });
      await prisma.product.deleteMany({ where: { userId: user.id } });
      await prisma.botSettings.deleteMany({ where: { userId: user.id } });
      await prisma.membership.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.verificationCode.deleteMany({ where: { userId: user.id } });

      // Eliminar usuario
      await prisma.user.delete({ where: { id: user.id } });

      eliminados.push({
        email: user.email,
        name: user.name,
      });

      console.log(`✅ Eliminado: ${user.email}`);
    }

    // Verificar usuario restante
    const usuarioRestante = await prisma.user.findUnique({
      where: { email: 'daveymena16@gmail.com' },
      include: {
        membership: true,
      },
    });

    // Estadísticas finales
    const stats = {
      usuarios: await prisma.user.count(),
      productos: await prisma.product.count(),
      conversaciones: await prisma.conversation.count(),
      mensajes: await prisma.message.count(),
    };

    console.log('✅ Limpieza completada!');

    return NextResponse.json({
      success: true,
      eliminados: eliminados.length,
      usuariosEliminados: eliminados,
      usuarioProtegido: usuarioRestante ? {
        email: usuarioRestante.email,
        name: usuarioRestante.name,
        verificado: usuarioRestante.emailVerified,
        membresia: usuarioRestante.membership?.plan || 'Sin membresía',
      } : null,
      estadisticas: stats,
      sinLimites: {
        usuarios: true,
        productos: true,
        conversaciones: true,
        mensajes: true,
        whatsapp: true,
      },
    });

  } catch (error) {
    console.error('❌ Error al limpiar usuarios:', error);
    return NextResponse.json(
      { 
        error: 'Error al limpiar usuarios',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET para verificar usuarios sin eliminar
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const usuariosAEliminar = usuarios.filter(
      (u) => u.email !== 'daveymena16@gmail.com'
    );

    return NextResponse.json({
      total: usuarios.length,
      usuarios: usuarios.map(u => ({
        email: u.email,
        name: u.name,
        verificado: u.emailVerified,
        creado: u.createdAt,
        seEliminara: u.email !== 'daveymena16@gmail.com',
      })),
      seEliminaran: usuariosAEliminar.length,
      usuarioProtegido: 'daveymena16@gmail.com',
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

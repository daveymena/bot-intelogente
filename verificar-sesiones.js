// Script para verificar sesiones en la base de datos

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarSesiones() {
  console.log('🔍 VERIFICANDO SESIONES\n');
  console.log('='.repeat(50));

  try {
    // 1. Ver todas las sesiones
    console.log('\n📊 SESIONES EN LA BASE DE DATOS:');
    const sesiones = await prisma.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total sesiones: ${sesiones.length}\n`);

    if (sesiones.length === 0) {
      console.log('⚠️  NO HAY SESIONES EN LA BASE DE DATOS');
      console.log('   Esto significa que necesitas hacer login de nuevo');
      console.log('   Ve a: http://localhost:3000/login');
      return;
    }

    sesiones.forEach((s, i) => {
      const ahora = new Date();
      const expirada = s.expiresAt < ahora;
      const diasRestantes = Math.ceil((s.expiresAt - ahora) / (1000 * 60 * 60 * 24));
      
      console.log(`${i + 1}. Usuario: ${s.user.email}`);
      console.log(`   Token: ${s.token.substring(0, 20)}...`);
      console.log(`   Creada: ${s.createdAt.toLocaleString('es-ES')}`);
      console.log(`   Expira: ${s.expiresAt.toLocaleString('es-ES')}`);
      console.log(`   Estado: ${expirada ? '❌ EXPIRADA' : `✅ ACTIVA (${diasRestantes} días)`}`);
      console.log('');
    });

    // 2. Verificar sesiones expiradas
    const sesionesExpiradas = sesiones.filter(s => s.expiresAt < new Date());
    if (sesionesExpiradas.length > 0) {
      console.log(`\n⚠️  HAY ${sesionesExpiradas.length} SESIONES EXPIRADAS`);
      console.log('   Puedes limpiarlas con: node limpiar-sesiones-expiradas.js');
    }

    // 3. Verificar sesiones activas
    const sesionesActivas = sesiones.filter(s => s.expiresAt >= new Date());
    console.log(`\n✅ SESIONES ACTIVAS: ${sesionesActivas.length}`);
    
    if (sesionesActivas.length > 0) {
      console.log('\n💡 PARA USAR UNA SESIÓN ACTIVA:');
      console.log('   1. Abre DevTools en el navegador (F12)');
      console.log('   2. Ve a Application > Cookies');
      console.log('   3. Busca la cookie "auth-token"');
      console.log('   4. Verifica que el valor coincida con uno de estos tokens:');
      sesionesActivas.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.token.substring(0, 30)}...`);
      });
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSesiones();

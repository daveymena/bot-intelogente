// Script para crear una sesión de prueba (solo para desarrollo)

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function crearSesionPrueba() {
  console.log('🔧 CREANDO SESIÓN DE PRUEBA\n');
  console.log('='.repeat(50));

  try {
    // Buscar el primer usuario
    const usuario = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!usuario) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('   Crea un usuario primero en: http://localhost:3000/register');
      return;
    }

    console.log(`\n✅ Usuario encontrado: ${usuario.email}`);

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');

    // Crear sesión que expira en 30 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const sesion = await prisma.session.create({
      data: {
        userId: usuario.id,
        token: token,
        expiresAt: expiresAt
      }
    });

    console.log('\n✅ SESIÓN CREADA EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log(`Token: ${token}`);
    console.log(`Expira: ${expiresAt.toLocaleString('es-ES')}`);
    console.log('='.repeat(50));

    console.log('\n📋 INSTRUCCIONES PARA USAR ESTA SESIÓN:');
    console.log('\n1. Abre DevTools en el navegador (F12)');
    console.log('2. Ve a: Application > Cookies > http://localhost:3000');
    console.log('3. Busca o crea la cookie "auth-token"');
    console.log('4. Establece el valor a:');
    console.log(`\n   ${token}\n`);
    console.log('5. Recarga la página');
    console.log('6. ¡Deberías estar logueado!');

    console.log('\n⚠️  NOTA: Esta es una solución temporal para desarrollo');
    console.log('   Lo correcto es hacer login desde: http://localhost:3000/login');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

crearSesionPrueba();

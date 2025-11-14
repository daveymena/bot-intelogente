import { db } from '../src/lib/db';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🔐 ACTIVAR SUSCRIPCIÓN ENTERPRISE ILIMITADA\n');
  console.log('='.repeat(60));

  try {
    // Solicitar email del usuario
    const email = await question('\n📧 Tu email (el que usas para login): ');

    if (!email) {
      console.error('❌ Email es requerido');
      rl.close();
      return;
    }

    // Buscar usuario
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      console.error(`❌ Usuario no encontrado con email: ${email}`);
      rl.close();
      return;
    }

    console.log('\n📊 Usuario encontrado:');
    console.log(`   Nombre: ${user.name || 'N/A'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Plan actual: ${user.subscriptionPlan || 'ninguno'}`);
    console.log(`   Estado: ${user.subscriptionStatus || 'ninguno'}`);

    const confirm = await question('\n¿Activar suscripción ENTERPRISE ILIMITADA? (s/n): ');

    if (confirm.toLowerCase() !== 's') {
      console.log('\n❌ Operación cancelada');
      rl.close();
      return;
    }

    // Calcular fecha de expiración (100 años = prácticamente ilimitado)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 100);

    // Actualizar usuario
    await db.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
      },
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ SUSCRIPCIÓN ACTIVADA EXITOSAMENTE\n');
    console.log('='.repeat(60));
    console.log(`\n📧 Email:        ${email}`);
    console.log(`📦 Plan:         ENTERPRISE`);
    console.log(`✨ Estado:       ACTIVA`);
    console.log(`⏱️  Expira:       ${expiresAt.toLocaleDateString()} (100 años)`);
    console.log(`\n🎉 Características:`);
    console.log(`   ✅ Mensajes ilimitados`);
    console.log(`   ✅ Productos ilimitados`);
    console.log(`   ✅ Conversaciones ilimitadas`);
    console.log(`   ✅ Todas las funcionalidades`);
    console.log(`   ✅ Sin restricciones`);
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Ahora puedes usar el sistema sin límites!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
  }
}

main();

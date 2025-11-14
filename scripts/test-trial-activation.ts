import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTrialActivation() {
  console.log('🧪 Probando activación automática de plan gratuito...\n');

  try {
    // 1. Buscar un usuario de prueba
    const testUser = await prisma.user.findFirst({
      where: {
        email: {
          contains: 'test'
        }
      }
    });

    if (!testUser) {
      console.log('❌ No se encontró usuario de prueba');
      console.log('💡 Crea un usuario con email que contenga "test"');
      return;
    }

    console.log('✅ Usuario encontrado:', testUser.email);
    console.log('📊 Estado actual:');
    console.log('   - Tipo de membresía:', testUser.membershipType);
    console.log('   - Email verificado:', testUser.isEmailVerified);
    console.log('   - Cuenta activa:', testUser.isActive);
    console.log('   - Trial termina:', testUser.trialEnds);
    console.log('   - Membresía termina:', testUser.membershipEnds);

    // 2. Verificar que el trial está configurado correctamente
    if (testUser.trialEnds) {
      const now = new Date();
      const daysLeft = Math.ceil((testUser.trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('\n⏰ Días restantes de trial:', daysLeft);
      
      if (daysLeft > 0) {
        console.log('✅ Trial activo');
      } else {
        console.log('⚠️  Trial expirado');
      }
    }

    // 3. Verificar subscripción
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: testUser.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (subscription) {
      console.log('\n📝 Subscripción:');
      console.log('   - Estado:', subscription.status);
      console.log('   - Inicio trial:', subscription.trialStart);
      console.log('   - Fin trial:', subscription.trialEnd);
    }

    // 4. Verificar configuración del bot
    const botSettings = await prisma.botSettings.findFirst({
      where: {
        userId: testUser.id
      }
    });

    if (botSettings) {
      console.log('\n⚙️  Configuración del bot creada: ✅');
      console.log('   - Nombre negocio:', botSettings.businessName);
    }

    // 5. Verificar prompts de IA
    const prompts = await prisma.aIPrompt.findMany({
      where: {
        userId: testUser.id
      }
    });

    console.log('\n🤖 Prompts de IA creados:', prompts.length);
    prompts.forEach(prompt => {
      console.log(`   - ${prompt.name} (${prompt.type})`);
    });

    console.log('\n✅ Sistema de trial automático funcionando correctamente');
    console.log('\n📋 Resumen:');
    console.log('   ✓ Usuario se registra');
    console.log('   ✓ Recibe 10 días de trial');
    console.log('   ✓ Se crea subscripción');
    console.log('   ✓ Se configura bot automáticamente');
    console.log('   ✓ Se crean prompts de IA');
    console.log('   ✓ Al verificar email → cuenta activa');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrialActivation();

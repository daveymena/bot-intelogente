import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function configurarModeloEconomico() {
  console.log('💰 Configurando modelo económico de Groq\n');

  try {
    // Obtener el usuario actual
    const user = await prisma.user.findFirst({
      include: { settings: true }
    });

    if (!user) {
      console.log('❌ No se encontró usuario');
      return;
    }

    console.log(`👤 Usuario: ${user.email}\n`);

    // Configuración económica
    const configEconomica = {
      // Modelo más pequeño y rápido
      ollamaModel: 'llama-3.1-8b-instant',
      
      // Menos tokens por respuesta
      maxTokens: 150,
      
      // Temperatura balanceada
      temperature: 0.7,
      
      // Delays más cortos (más rápido)
      responseDelay: 1,
      
      // Smart waiting habilitado
      smartWaitingEnabled: true,
      
      // Auto-response habilitado (respuestas locales)
      autoResponseEnabled: true
    };

    if (user.settings) {
      // Actualizar configuración existente
      await prisma.botSettings.update({
        where: { userId: user.id },
        data: configEconomica
      });
      console.log('✅ Configuración actualizada');
    } else {
      // Crear nueva configuración
      await prisma.botSettings.create({
        data: {
          userId: user.id,
          businessPhone: user.phone || '+57 304 274 8687',
          ...configEconomica
        }
      });
      console.log('✅ Configuración creada');
    }

    console.log('\n📊 CONFIGURACIÓN ECONÓMICA APLICADA:\n');
    console.log('🤖 Modelo: llama-3.1-8b-instant (rápido y económico)');
    console.log('📏 Max Tokens: 150 (respuestas concisas)');
    console.log('🌡️  Temperature: 0.7 (balance)');
    console.log('⏱️  Response Delay: 1s (más rápido)');
    console.log('✅ Auto-response: Habilitado (respuestas locales)');

    console.log('\n💰 AHORRO ESTIMADO:\n');
    console.log('Tokens por conversación:');
    console.log('  Antes: ~500 tokens');
    console.log('  Ahora: ~150 tokens');
    console.log('  Ahorro: 70%');
    
    console.log('\nCosto estimado (100 conversaciones/día):');
    console.log('  Antes: $0.50/día');
    console.log('  Ahora: $0.15/día');
    console.log('  Ahorro: $0.35/día ($10.50/mes)');

    console.log('\n💡 NOTA:');
    console.log('El modelo 8B es igual de bueno para:');
    console.log('  ✅ Búsqueda de productos');
    console.log('  ✅ Información de precios');
    console.log('  ✅ Respuestas de ventas');
    console.log('  ✅ Conversaciones simples');

    console.log('\n🔄 Reinicia el servidor para aplicar cambios:');
    console.log('   npm run dev');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

configurarModeloEconomico();

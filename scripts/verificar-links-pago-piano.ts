import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarLinksPago() {
  try {
    const curso = await prisma.product.findFirst({
      where: { name: { contains: 'Piano' } }
    });

    if (!curso) {
      console.log('❌ No se encontró el curso');
      return;
    }

    console.log('📦 Curso de Piano:');
    console.log(`   Nombre: ${curso.name}`);
    console.log(`   Tags: ${curso.tags}`);
    console.log(`   Hotmart Link: ${curso.hotmartLink || 'NO CONFIGURADO'}`);
    console.log(`   MercadoPago Link: ${curso.mercadoPagoLink || 'NO CONFIGURADO'}`);
    console.log(`   PayPal Link: ${curso.paypalLink || 'NO CONFIGURADO'}`);

    // Verificar si tiene links en los tags
    if (curso.tags) {
      const tags = curso.tags.split(',');
      const hotmartTag = tags.find(t => t.startsWith('hotmart:'));
      const mercadopagoTag = tags.find(t => t.startsWith('mercadopago:'));
      
      console.log('\n📋 Links en tags:');
      console.log(`   Hotmart: ${hotmartTag || 'NO'}`);
      console.log(`   MercadoPago: ${mercadopagoTag || 'NO'}`);
    }

    if (!curso.hotmartLink && !curso.mercadoPagoLink && !curso.tags?.includes('hotmart:')) {
      console.log('\n⚠️  El producto NO tiene links de pago configurados');
      console.log('   El bot no podrá enviar links reales');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarLinksPago();

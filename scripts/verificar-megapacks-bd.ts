import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarMegapacks() {
  try {
    console.log('🔍 Verificando megapacks en la base de datos...\n');

    const megapacks = await prisma.product.findMany({
      where: {
        name: {
          contains: 'Mega Pack'
        }
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        price: true,
        status: true
      }
    });

    console.log(`📊 Total de megapacks encontrados: ${megapacks.length}\n`);

    megapacks.forEach((mp, index) => {
      console.log(`${index + 1}. ${mp.name} - $${mp.price} - ${mp.status}`);
    });

    // Extraer números de los megapacks
    const numeros = megapacks
      .map(mp => {
        const match = mp.name.match(/Mega Pack (\d+)/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(n => n !== null)
      .sort((a, b) => a! - b!);

    console.log(`\n📋 Números de megapacks presentes: ${numeros.join(', ')}`);

    // Encontrar números faltantes del 1 al 40
    const faltantes = [];
    for (let i = 1; i <= 40; i++) {
      if (!numeros.includes(i)) {
        faltantes.push(i);
      }
    }

    if (faltantes.length > 0) {
      console.log(`\n❌ Megapacks faltantes (${faltantes.length}): ${faltantes.join(', ')}`);
    } else {
      console.log('\n✅ Todos los megapacks del 1 al 40 están presentes');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarMegapacks();

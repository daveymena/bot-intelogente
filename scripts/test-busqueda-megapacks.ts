import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBusquedaMegapacks() {
  try {
    console.log('🔍 Probando búsqueda de megapacks...\n');

    // Simular búsqueda del bot
    const query = 'megapack';
    
    const productos = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        ],
        status: 'AVAILABLE'
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📦 Productos encontrados con "${query}": ${productos.length}\n`);

    // Filtrar solo megapacks numerados
    const megapacksNumerados = productos.filter(p => 
      /Mega Pack \d+:/.test(p.name)
    );

    console.log(`🔢 Megapacks numerados (1-40): ${megapacksNumerados.length}\n`);

    // Mostrar algunos ejemplos
    console.log('📋 Primeros 10 megapacks:');
    megapacksNumerados.slice(0, 10).forEach((mp, i) => {
      console.log(`   ${i + 1}. ${mp.name}`);
    });

    console.log('\n📋 Últimos 10 megapacks:');
    megapacksNumerados.slice(-10).forEach((mp, i) => {
      console.log(`   ${i + 1}. ${mp.name}`);
    });

    // Verificar que estén todos del 1 al 40
    const numeros = megapacksNumerados
      .map(mp => {
        const match = mp.name.match(/Mega Pack (\d+)/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(n => n !== null && n >= 1 && n <= 40)
      .sort((a, b) => a! - b!);

    console.log(`\n✅ Megapacks del 1 al 40 disponibles: ${numeros.length}/40`);

    if (numeros.length === 40) {
      console.log('🎉 ¡Todos los megapacks están disponibles para el bot!');
    } else {
      const faltantes = [];
      for (let i = 1; i <= 40; i++) {
        if (!numeros.includes(i)) {
          faltantes.push(i);
        }
      }
      console.log(`❌ Faltan: ${faltantes.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBusquedaMegapacks();

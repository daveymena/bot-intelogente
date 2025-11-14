const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function buscarMegapacks() {
  console.log('🔍 Buscando Mega Packs, Piano y Moto...\n');
  
  const productos = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Mega Pack', mode: 'insensitive' } },
        { name: { contains: 'Piano', mode: 'insensitive' } },
        { name: { contains: 'Moto', mode: 'insensitive' } },
        { name: { contains: 'NS-160', mode: 'insensitive' } },
        { name: { contains: 'NS 160', mode: 'insensitive' } }
      ]
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`📦 Productos encontrados: ${productos.length}\n`);
  
  const megapacks = productos.filter(p => p.name.toLowerCase().includes('mega pack'));
  const piano = productos.filter(p => p.name.toLowerCase().includes('piano'));
  const moto = productos.filter(p => p.name.toLowerCase().includes('moto') || p.name.toLowerCase().includes('ns'));
  
  console.log(`🎓 Mega Packs: ${megapacks.length}`);
  megapacks.forEach(p => console.log(`   - ${p.name} ($${p.price})`));
  
  console.log(`\n🎹 Curso de Piano: ${piano.length}`);
  piano.forEach(p => console.log(`   - ${p.name} ($${p.price})`));
  
  console.log(`\n🏍️  Moto NS-160: ${moto.length}`);
  moto.forEach(p => console.log(`   - ${p.name} ($${p.price})`));
  
  await prisma.$disconnect();
}

buscarMegapacks().catch(console.error);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function buscar() {
  const productos = await prisma.product.findMany({
    select: { id: true, name: true, description: true }
  });
  
  console.log('=== BUSCANDO: reparación, computador ===\n');
  
  const encontrados = productos.filter(p => {
    const texto = (p.name + ' ' + (p.description || '')).toLowerCase();
    return texto.includes('reparaci') || 
           texto.includes('computador') ||
           texto.includes('pc ') ||
           texto.includes(' pc');
  });
  
  encontrados.forEach(p => {
    console.log(`- ${p.name}`);
    if (p.description) console.log(`  ${p.description.substring(0, 100)}`);
    console.log('');
  });
  
  console.log(`Total encontrados: ${encontrados.length}`);
  
  await prisma.$disconnect();
}

buscar();


import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
const prisma = new PrismaClient();

async function debug() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'AVAILABLE' }
    });

    let output = `Total available products: ${products.length}\n`;

    const idiomas = products.filter(p => 
      p.name.toLowerCase().includes('idioma') || 
      (p.description || '').toLowerCase().includes('idioma') ||
      (p.tags || '').toLowerCase().includes('idioma') ||
      p.name.toLowerCase().includes('ingl') ||
      p.name.toLowerCase().includes('franc')
    );

    output += '\n--- IDIOMAS CANDIDATES ---\n';
    idiomas.forEach(p => {
      output += `- [${p.id}] ${p.name}\n`;
      output += `  Tags: ${p.tags}\n`;
    });

    const diseño = products.filter(p => 
      p.name.toLowerCase().includes('diseño')
    );
    output += '\n--- DISEÑO CANDIDATES ---\n';
    diseño.slice(0, 5).forEach(p => output += `- ${p.name}\n`);

    fs.writeFileSync('search_debug.txt', output);
    console.log('Results written to search_debug.txt');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

debug();

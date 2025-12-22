
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando imágenes de productos...\n');

  // Buscar Mega Pack 17
  const megapack17 = await prisma.product.findFirst({
    where: { name: { contains: 'Mega Pack 17', mode: 'insensitive' } }
  });

  if (megapack17) {
    console.log('✅ Mega Pack 17 encontrado:');
    console.log('  ID:', megapack17.id);
    console.log('  Nombre:', megapack17.name);
    console.log('  Images (raw):', megapack17.images);
    
    try {
      const imagesParsed = JSON.parse(megapack17.images || '[]');
      console.log('  Images (parsed):', imagesParsed);
      console.log('  Cantidad de imágenes:', imagesParsed.length);
      
      if (imagesParsed.length > 0) {
        console.log('  Primera imagen:', imagesParsed[0]);
        console.log('  ¿Empieza con http?:', imagesParsed[0].startsWith('http'));
        console.log('  ¿Empieza con /?:', imagesParsed[0].startsWith('/'));
      }
    } catch (error) {
      console.log('  ❌ Error parseando:', error.message);
    }
  } else {
    console.log('❌ Mega Pack 17 NO encontrado');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

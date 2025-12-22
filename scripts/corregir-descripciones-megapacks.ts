import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirDescripcionesMegapacks() {
  console.log('📦 Corrigiendo descripciones de Megapacks...\n');

  try {
    // Obtener todos los megapacks
    const megapacks = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Mega Pack', mode: 'insensitive' } },
          { name: { contains: 'PACK COMPLETO', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`📦 Encontrados ${megapacks.length} megapacks\n`);

    let actualizados = 0;

    for (const pack of megapacks) {
      // Descripción genérica y honesta
      const descripcionGenerica = `📚 ${pack.name}

✅ Colección digital de cursos y recursos
✅ Contenido descargable
✅ Entrega inmediata por enlace
✅ Variedad de temas y materiales

💡 Ideal para:
• Aprender nuevas habilidades
• Ampliar conocimientos
• Estudiar a tu propio ritmo
• Tener material de referencia

📥 Recibes el enlace de descarga al confirmar tu compra`;

      await prisma.product.update({
        where: { id: pack.id },
        data: { description: descripcionGenerica }
      });

      console.log(`✅ ${pack.name}`);
      actualizados++;
    }

    console.log(`\n✅ Total actualizados: ${actualizados}`);
    console.log('\n💡 Todas las descripciones ahora son genéricas y honestas');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirDescripcionesMegapacks();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirTodasImagenesInvalidas() {
  console.log('🔧 Corrigiendo todas las imágenes inválidas...\n');

  try {
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    console.log(`📦 Total de productos: ${productos.length}\n`);

    let corregidos = 0;
    let sinImagenes = 0;
    let yaCorrectos = 0;

    for (const producto of productos) {
      // Si no tiene imágenes, saltar
      if (!producto.images) {
        sinImagenes++;
        continue;
      }

      // Intentar parsear como JSON
      try {
        const parsed = JSON.parse(producto.images);
        
        // Si ya es un array válido, verificar que las URLs sean válidas
        if (Array.isArray(parsed) && parsed.length > 0) {
          const primeraUrl = parsed[0];
          
          // Verificar si es una URL válida
          if (typeof primeraUrl === 'string' && primeraUrl.startsWith('http')) {
            yaCorrectos++;
            continue;
          }
        }
      } catch (e) {
        // No es JSON válido, intentar corregir
      }

      // Si llegamos aquí, la imagen está corrupta
      console.log(`❌ Imagen corrupta en: ${producto.name}`);
      console.log(`   Valor actual: ${producto.images.substring(0, 100)}...`);

      // Intentar extraer URL si está dentro del string
      const urlMatch = producto.images.match(/https?:\/\/[^\s"'\]]+/);
      
      if (urlMatch) {
        const urlCorrecta = urlMatch[0];
        const imagesJson = JSON.stringify([urlCorrecta]);
        
        await prisma.product.update({
          where: { id: producto.id },
          data: { images: imagesJson }
        });
        
        console.log(`✅ Corregido: ${urlCorrecta}\n`);
        corregidos++;
      } else {
        console.log(`⚠️  No se pudo extraer URL válida\n`);
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log(`✅ Productos corregidos: ${corregidos}`);
    console.log(`✔️  Productos ya correctos: ${yaCorrectos}`);
    console.log(`⚠️  Productos sin imágenes: ${sinImagenes}`);
    console.log(`📦 Total procesados: ${productos.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirTodasImagenesInvalidas();

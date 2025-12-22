import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirImagenCursoPiano() {
  console.log('🔧 Corrigiendo imagen del Curso de Piano...\n');

  try {
    // Buscar el curso de piano
    const cursoPiano = await prisma.product.findFirst({
      where: {
        name: {
          contains: 'Piano',
          mode: 'insensitive'
        }
      }
    });

    if (!cursoPiano) {
      console.log('❌ No se encontró el Curso de Piano');
      return;
    }

    console.log('📦 Producto encontrado:');
    console.log(`   Nombre: ${cursoPiano.name}`);
    console.log(`   ID: ${cursoPiano.id}`);
    console.log(`   Imágenes actuales:`, cursoPiano.images);
    console.log(`   Tipo: ${typeof cursoPiano.images}`);
    console.log(`   Es array: ${Array.isArray(cursoPiano.images)}`);
    
    if (Array.isArray(cursoPiano.images)) {
      console.log(`   Longitud del array: ${cursoPiano.images.length}`);
      if (cursoPiano.images.length > 0) {
        console.log(`   Primer elemento: "${cursoPiano.images[0]}"`);
      }
    }

    // URL correcta de la imagen (como JSON string array)
    const imagenCorrecta = 'https://img-c.udemycdn.com/course/480x270/2550655_f43c_2.jpg';
    const imagesJson = JSON.stringify([imagenCorrecta]);

    // Actualizar con la imagen correcta
    const actualizado = await prisma.product.update({
      where: { id: cursoPiano.id },
      data: {
        images: imagesJson // JSON string array
      }
    });

    console.log('\n✅ Imagen corregida exitosamente!');
    console.log('📸 Nueva imagen:', actualizado.images);
    console.log('\n🔗 URL de la imagen:');
    console.log(imagenCorrecta);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirImagenCursoPiano();

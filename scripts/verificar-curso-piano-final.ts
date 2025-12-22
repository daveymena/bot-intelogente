import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarCursoPiano() {
  console.log('🎹 Verificando Curso de Piano...\n');

  try {
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

    console.log('✅ CURSO DE PIANO ENCONTRADO\n');
    console.log('📦 Información del Producto:');
    console.log(`   ID: ${cursoPiano.id}`);
    console.log(`   Nombre: ${cursoPiano.name}`);
    console.log(`   Precio: $${cursoPiano.price.toLocaleString()} ${cursoPiano.currency}`);
    console.log(`   Categoría: ${cursoPiano.category}`);
    console.log(`   Subcategoría: ${cursoPiano.subcategory || 'N/A'}`);
    console.log(`   Estado: ${cursoPiano.status}`);
    
    console.log('\n📸 Imágenes:');
    console.log(`   Raw: ${cursoPiano.images}`);
    
    if (cursoPiano.images) {
      try {
        const imageArray = JSON.parse(cursoPiano.images);
        console.log(`   ✅ JSON válido`);
        console.log(`   📊 Cantidad: ${imageArray.length}`);
        
        imageArray.forEach((url: string, index: number) => {
          console.log(`   ${index + 1}. ${url}`);
        });
      } catch (e) {
        console.log(`   ❌ Error al parsear JSON: ${e}`);
      }
    } else {
      console.log('   ⚠️  Sin imágenes');
    }

    console.log('\n📝 Descripción:');
    console.log(`   ${cursoPiano.description || 'Sin descripción'}`);

    console.log('\n🏷️ Tags:');
    if (cursoPiano.tags) {
      try {
        const tagsArray = JSON.parse(cursoPiano.tags);
        console.log(`   ${tagsArray.join(', ')}`);
      } catch (e) {
        console.log(`   ${cursoPiano.tags}`);
      }
    } else {
      console.log('   Sin tags');
    }

    console.log('\n✅ Verificación completada!');
    console.log('\n💡 Próximo paso: Probar en WhatsApp');
    console.log('   Mensaje de prueba: "Hola, me interesa el curso de piano"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCursoPiano();

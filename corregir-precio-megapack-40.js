/**
 * Corregir precio del Megapack de 40 cursos
 * Debe costar $60,000 COP (no $20,000)
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function corregirPrecio() {
  console.log('\n🔧 CORRIGIENDO PRECIO DEL MEGAPACK DE 40 CURSOS\n');
  console.log('='.repeat(70));
  
  try {
    // Buscar el Megapack 40
    const megapack40 = await db.product.findFirst({
      where: {
        name: { contains: 'Mega Pack 40', mode: 'insensitive' }
      }
    });
    
    if (!megapack40) {
      console.log('❌ No se encontró el Megapack 40');
      return;
    }
    
    console.log('\n📦 PRODUCTO ENCONTRADO:');
    console.log(`   Nombre: ${megapack40.name}`);
    console.log(`   ID: ${megapack40.id}`);
    console.log(`   Precio actual: ${megapack40.price.toLocaleString('es-CO')} COP`);
    
    // Actualizar precio a $60,000
    const updated = await db.product.update({
      where: { id: megapack40.id },
      data: { price: 60000 }
    });
    
    console.log('\n✅ PRECIO ACTUALIZADO:');
    console.log(`   Precio anterior: ${megapack40.price.toLocaleString('es-CO')} COP`);
    console.log(`   Precio nuevo: ${updated.price.toLocaleString('es-CO')} COP`);
    console.log('\n' + '='.repeat(70));
    console.log('✅ CORRECCIÓN COMPLETADA\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

corregirPrecio();

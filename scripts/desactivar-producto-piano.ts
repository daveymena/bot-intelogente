/**
 * Desactivar temporalmente el producto de Piano
 * para evitar que interfiera con las búsquedas
 */

import { db } from '../src/lib/db';

async function desactivarPiano() {
  console.log('🔧 Desactivando producto de Piano...\n');

  const piano = await db.product.findFirst({
    where: {
      name: {
        contains: 'Piano'
      }
    }
  });

  if (!piano) {
    console.log('❌ No se encontró producto de Piano');
    return;
  }

  console.log(`📦 Producto encontrado: ${piano.name}`);
  console.log(`💰 Precio: $${piano.price.toLocaleString('es-CO')}`);
  console.log(`🆔 ID: ${piano.id}`);
  console.log(`📊 Estado actual: ${piano.status}`);

  if (piano.status === 'OUT_OF_STOCK') {
    console.log('\n✅ El producto ya está desactivado');
    return;
  }

  await db.product.update({
    where: { id: piano.id },
    data: {
      status: 'OUT_OF_STOCK'
    }
  });

  console.log('\n✅ Producto desactivado exitosamente');
  console.log('   El bot ya no lo mostrará en las búsquedas');
}

desactivarPiano()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

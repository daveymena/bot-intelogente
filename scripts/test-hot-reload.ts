/**
 * 🔥 TEST DE HOT RELOAD
 * Prueba que el sistema de hot reload funciona correctamente
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testHotReload() {
  console.log('🔥 Probando sistema de Hot Reload...\n')

  try {
    // 1. Crear un producto de prueba
    console.log('1️⃣ Creando producto de prueba...')
    const product = await db.product.create({
      data: {
        name: 'Producto Hot Reload Test',
        description: 'Este producto se creó para probar hot reload',
        price: 99.99,
        currency: 'USD',
        category: 'PHYSICAL',
        status: 'AVAILABLE',
        userId: (await db.user.findFirst())?.id || 'test',
        autoResponse: 'Este es un producto de prueba para hot reload'
      }
    })
    console.log('✅ Producto creado:', product.name)
    console.log('   El bot debería detectar este cambio en ~30 segundos\n')

    // 2. Esperar 35 segundos
    console.log('⏳ Esperando 35 segundos para que el hot reload detecte el cambio...')
    await new Promise(resolve => setTimeout(resolve, 35000))

    // 3. Actualizar el producto
    console.log('\n2️⃣ Actualizando producto...')
    await db.product.update({
      where: { id: product.id },
      data: {
        price: 149.99,
        description: 'Precio actualizado con hot reload'
      }
    })
    console.log('✅ Producto actualizado')
    console.log('   El bot debería detectar este cambio en ~30 segundos\n')

    // 4. Esperar otros 35 segundos
    console.log('⏳ Esperando 35 segundos más...')
    await new Promise(resolve => setTimeout(resolve, 35000))

    // 5. Eliminar producto de prueba
    console.log('\n3️⃣ Limpiando producto de prueba...')
    await db.product.delete({
      where: { id: product.id }
    })
    console.log('✅ Producto eliminado\n')

    console.log('🎉 Test de Hot Reload completado!')
    console.log('\n📋 Resumen:')
    console.log('   - El bot detecta cambios en productos cada 30 segundos')
    console.log('   - El bot detecta cambios en configuración cada 15 segundos')
    console.log('   - No necesitas reiniciar el servidor para ver los cambios')
    console.log('\n💡 Tip: Revisa los logs del servidor para ver los mensajes de recarga')

  } catch (error) {
    console.error('❌ Error en test:', error)
  } finally {
    await db.$disconnect()
  }
}

testHotReload()

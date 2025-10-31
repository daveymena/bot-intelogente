/**
 * 🖼️ Actualizar imagen del Ultra Mega Pack
 */

import { db } from '../src/lib/db'

async function actualizarImagen() {
  try {
    console.log('🖼️ Actualizando imagen del Ultra Mega Pack...\n')

    // Buscar el producto
    const producto = await db.product.findFirst({
      where: {
        name: {
          contains: 'MegaSuperpack'
        }
      }
    })

    if (!producto) {
      console.error('❌ No se encontró el producto')
      return
    }

    console.log('✅ Producto encontrado:', producto.name)

    // Actualizar con la imagen URL
    const productoActualizado = await db.product.update({
      where: { id: producto.id },
      data: {
        images: JSON.stringify([
          'https://megapack-nu.vercel.app/supermegapack.jpg'
        ])
      }
    })

    console.log('\n✅ Imagen actualizada exitosamente!')
    console.log('🖼️ Nueva imagen:', 'https://megapack-nu.vercel.app/supermegapack.jpg')
    console.log('\n🎯 El bot ahora enviará esta imagen cuando pregunten por el megapack')

    console.log('\n💡 Prueba enviando desde WhatsApp:')
    console.log('   "Envíame fotos del megapack"')
    console.log('   "Quiero ver el pack completo"')
    console.log('   "Muéstrame el ultra pack"')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

actualizarImagen()

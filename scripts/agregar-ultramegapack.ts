/**
 * 🚀 Agregar Ultra Mega Pack Completo
 */

import { db } from '../src/lib/db'

async function agregarUltraMegaPack() {
  try {
    console.log('🚀 Agregando Ultra Mega Pack Completo...\n')

    // Obtener el usuario admin
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    console.log('✅ Usuario admin encontrado:', admin.email)

    // Crear el producto
    const producto = await db.product.create({
      data: {
        name: 'MegaSuperpack Completo',
        description: `¡EL PACK DIGITAL MÁS COMPLETO DE LA HISTORIA!

📦 CONTENIDO INCLUIDO:
• 2,056 FLUJOS N8N PROFESIONALES
• 1TB DE CURSOS PREMIUM
• 20,000+ TEMPLATES PROFESIONALES
• 6H CURSO N8N COMPLETO
• 17,000 CÓDIGOS FUENTE
• 29,522+ NODOS LISTOS PARA USAR

🎯 TODO LO QUE NECESITAS:
✅ Automatización con N8N
✅ Diseño profesional
✅ Programación avanzada
✅ Negocios digitales
✅ Marketing y ventas
✅ Desarrollo web y apps

🚀 CARACTERÍSTICAS:
• Navegador ultrarrápido con búsqueda instantánea
• Organización profesional por categorías
• Actualizaciones constantes
• Soporte técnico incluido
• Acceso de por vida

💰 TRANSFORMA TU CARRERA:
Empieza a generar ingresos desde hoy mismo con las herramientas más completas del mercado digital.

🎁 BONOS INCLUIDOS:
• Comunidad privada
• Actualizaciones gratuitas
• Soporte prioritario
• Certificado de finalización`,
        price: 49.99,
        currency: 'USD',
        category: 'DIGITAL',
        status: 'AVAILABLE',
        images: JSON.stringify([
          '/fotos/megapack completo.png',
          '/fotos/megapack2.jpg'
        ]),
        tags: JSON.stringify([
          'megapack',
          'mega pack',
          'ultra pack',
          'pack completo',
          'n8n',
          'flujos',
          'cursos',
          'templates',
          'códigos',
          'automatización',
          'programación',
          'diseño',
          'negocios',
          'digital',
          'completo',
          'premium',
          'profesional'
        ]),
        autoResponse: `🎉 ¡EXCELENTE ELECCIÓN! El MegaSuperpack Completo es nuestro producto estrella.

📦 INCLUYE:
✅ 2,056 Flujos N8N Profesionales
✅ 1TB de Cursos Premium
✅ 20,000+ Templates
✅ 6H Curso N8N
✅ 17,000 Códigos Fuente
✅ 29,522+ Nodos

💰 PRECIO ESPECIAL: $49.99 USD

🎁 BONOS:
• Acceso de por vida
• Actualizaciones gratuitas
• Soporte prioritario
• Comunidad privada

Este pack tiene TODO lo que necesitas para dominar el mundo digital y empezar a generar ingresos desde hoy.

¿Te gustaría proceder con la compra? 🚀`,
        userId: admin.id
      }
    })

    console.log('\n✅ Ultra Mega Pack creado exitosamente!')
    console.log('📦 ID:', producto.id)
    console.log('💰 Precio: $49.99 USD')
    console.log('📸 Imágenes:', JSON.parse(producto.images as string).length)
    console.log('🏷️ Tags:', JSON.parse(producto.tags as string).length)

    console.log('\n🎯 El bot ahora puede:')
    console.log('   • Reconocer cuando pregunten por "megapack", "pack completo", "n8n"')
    console.log('   • Enviar las fotos del producto')
    console.log('   • Dar información detallada')
    console.log('   • Ofrecer el link de pago')

    console.log('\n💡 Prueba enviando desde WhatsApp:')
    console.log('   "Cuéntame del megapack"')
    console.log('   "Quiero el pack completo"')
    console.log('   "Envíame info del ultra pack"')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

agregarUltraMegaPack()

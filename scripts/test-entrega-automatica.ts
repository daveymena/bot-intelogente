/**
 * 🧪 TEST DE ENTREGA AUTOMÁTICA
 * Prueba el sistema de entrega de links de Google Drive
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function testDeliverySystem() {
  console.log('🧪 PRUEBA DE ENTREGA AUTOMÁTICA\n')
  console.log('=' .repeat(50))
  
  // 1. Verificar productos con deliveryLink
  console.log('\n📦 1. Verificando productos con links de entrega...\n')
  
  const productosConLink = await db.product.findMany({
    where: {
      deliveryLink: { not: null }
    },
    select: {
      id: true,
      name: true,
      price: true,
      deliveryLink: true
    },
    take: 10
  })
  
  console.log(`✅ Encontrados ${productosConLink.length} productos con link de entrega:\n`)
  
  productosConLink.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}`)
    console.log(`      💰 Precio: $${p.price.toLocaleString()} COP`)
    console.log(`      🔗 Link: ${p.deliveryLink?.substring(0, 50)}...`)
    console.log('')
  })
  
  // 2. Verificar MEGA PACK COMPLETO
  console.log('\n🎓 2. Verificando MEGA PACK COMPLETO...\n')
  
  const megapackCompleto = await db.product.findFirst({
    where: {
      OR: [
        { name: { contains: 'MEGA PACK COMPLETO' } },
        { name: { contains: '81 Cursos' } }
      ]
    }
  })
  
  if (megapackCompleto) {
    console.log(`   ✅ Encontrado: ${megapackCompleto.name}`)
    console.log(`   💰 Precio: $${megapackCompleto.price.toLocaleString()} COP`)
    console.log(`   🔗 Link: ${megapackCompleto.deliveryLink || 'NO CONFIGURADO'}`)
  } else {
    console.log('   ⚠️ MEGA PACK COMPLETO no encontrado')
  }
  
  // 3. Contar productos sin link
  console.log('\n📊 3. Estadísticas de productos...\n')
  
  const totalProductos = await db.product.count()
  const productosDigitales = await db.product.count({
    where: { category: 'DIGITAL' }
  })
  const conLink = await db.product.count({
    where: { deliveryLink: { not: null } }
  })
  const sinLink = await db.product.count({
    where: { 
      category: 'DIGITAL',
      deliveryLink: null 
    }
  })
  
  console.log(`   📦 Total productos: ${totalProductos}`)
  console.log(`   💻 Productos digitales: ${productosDigitales}`)
  console.log(`   ✅ Con link de entrega: ${conLink}`)
  console.log(`   ⚠️ Digitales sin link: ${sinLink}`)
  
  // 4. Simular entrega
  console.log('\n🚀 4. Simulación de entrega...\n')
  
  if (productosConLink.length > 0) {
    const productoTest = productosConLink[0]
    console.log(`   Simulando entrega de: ${productoTest.name}`)
    console.log(`   📧 Email: test@example.com`)
    console.log(`   📱 WhatsApp: 573136174267`)
    console.log('')
    console.log('   📝 Mensaje que se enviaría:')
    console.log('   ' + '-'.repeat(40))
    console.log(`
   🎉 *¡PAGO CONFIRMADO!*

   ¡Gracias por tu compra! 🙏

   📦 *Producto:* ${productoTest.name}

   🔗 *Tu acceso está listo:*
   ${productoTest.deliveryLink}

   📝 *Instrucciones:*
   1. Haz clic en el enlace
   2. Inicia sesión con tu cuenta de Google
   3. ¡Disfruta tu contenido!

   _Tecnovariedades D&S_ ✨
    `)
  }
  
  // 5. Verificar configuración de webhooks
  console.log('\n⚙️ 5. Configuración de webhooks...\n')
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'
  console.log(`   🌐 URL de la app: ${appUrl}`)
  console.log(`   📥 Webhook MercadoPago: ${appUrl}/api/payments/webhook`)
  console.log(`   📥 Webhook PayPal: ${appUrl}/api/payments/webhook`)
  console.log('')
  console.log('   📋 Para configurar en MercadoPago:')
  console.log('      1. Ir a: https://www.mercadopago.com.co/developers/panel')
  console.log('      2. Seleccionar tu aplicación')
  console.log('      3. Ir a "Webhooks" o "Notificaciones IPN"')
  console.log(`      4. Agregar URL: ${appUrl}/api/payments/webhook`)
  console.log('      5. Seleccionar eventos: payment')
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ PRUEBA COMPLETADA')
  console.log('='.repeat(50))
}

testDeliverySystem()
  .catch(console.error)
  .finally(() => db.$disconnect())

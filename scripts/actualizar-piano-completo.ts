import { db } from '../src/lib/db'

async function actualizarPiano() {
  try {
    console.log('🎹 Actualizando Curso de Piano...\n')

    const piano = await db.product.findFirst({
      where: { 
        OR: [
          { name: { contains: 'piano', mode: 'insensitive' } },
          { name: { contains: 'Piano' } }
        ]
      }
    })

    if (!piano) {
      console.log('❌ No se encontró el producto de Piano')
      return
    }

    // Actualizar producto con links de pago y descripción completa
    await db.product.update({
      where: { id: piano.id },
      data: {
        name: 'Mega Pack Curso de Piano Completo',
        description: 'Aprende piano desde cero hasta nivel avanzado. 19 horas de video + 157 recursos.',
        price: 60000, // COP
        paymentLinkMercadoPago: 'https://mpago.li/32cJgK3', // Link estático (no expira)
        // PayPal se genera dinámicamente cuando se solicita
        autoResponse: `🎹 *Mega Pack Curso de Piano Completo*
💰 Precio: $60.000 COP
🎬 Formato: 100% Pregrabado / Drive
📲 Entrega: Correo / WhatsApp
⚠️ Diploma: No incluye certificado

━━━━━━━━━━━━━━━━━━
📋 *Descripción*
Aprende piano desde cero hasta nivel avanzado. 19 horas de video + 157 recursos.
━━━━━━━━━━━━━━━━━━

💳 OPCIONES DE PAGO:

1. MercadoPago - $49.99 USD - 🔗 https://mpago.li/32cJgK3

2. PayPal - $15.00 USD - (Link generado al solicitar)

━━━━━━━━━━━━━━━━━━

🛡️ Garantía: 7 días de Satisfacción | 📦 Entrega: Link de Acceso
📩 ¿Deseas comprarlo y recibir el acceso ahora mismo?`
      }
    })

    console.log('✅ Producto actualizado exitosamente')
    console.log('\n📋 Detalles:')
    console.log('   - Nombre: Mega Pack Curso de Piano Completo')
    console.log('   - Precio: $60.000 COP')
    console.log('   - MercadoPago: https://mpago.li/32cJgK3 (estático)')
    console.log('   - PayPal: Se genera dinámicamente')
    console.log('   - Formato: 100% Pregrabado')
    console.log('   - Entrega: Correo/WhatsApp')
    console.log('   - Certificado: No incluye')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

actualizarPiano()

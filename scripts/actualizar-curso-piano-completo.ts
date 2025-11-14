import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function actualizarCursoPiano() {
  console.log('🎹 Actualizando Curso de Piano con información completa...\n')

  try {
    // Buscar el curso de piano existente
    const cursoExistente = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'Piano', mode: 'insensitive' } },
          { name: { contains: 'Curso Piano', mode: 'insensitive' } }
        ]
      }
    })

    if (!cursoExistente) {
      console.log('❌ No se encontró el curso de piano')
      console.log('💡 Creando nuevo producto...\n')
    }

    // Datos del curso desde el JSON
    const cursoPianoData = {
      name: 'Curso Piano Profesional Completo',
      description: 'Curso 100% en línea con videos descargables para aprender piano desde cero hasta nivel profesional. +80 lecciones en video HD con acceso de por vida',
      price: 60000,
      currency: 'COP',
      category: 'DIGITAL' as const,
      status: 'AVAILABLE' as const,
      
      // Imagen real de la landing page
      images: JSON.stringify([
        'https://landein-page-pian2.vercel.app/piano-curso.jpg'
      ]),
      
      // Tags con métodos de pago y palabras clave
      tags: JSON.stringify([
        'nequi:3042748687',
        'daviplata:3042748687',
        'hotmart:https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205',
        'whatsapp:+573042748687',
        'curso',
        'digital',
        'piano',
        'musica',
        'profesional',
        'online',
        'videos',
        'descargable'
      ]),
      
      // Respuesta automática mejorada
      autoResponse: `🎹 **Curso Piano Profesional Completo**

📚 **Descripción:**
Curso 100% en línea con videos descargables para aprender piano desde cero hasta nivel profesional.

✨ **Características:**
• +80 lecciones en video HD
• Módulos progresivos
• Acceso de por vida
• Contenido descargable
• Soporte directo del profesor

💰 **Precio:** $60.000 COP

🎁 **Garantía:** 7 días incluida
⚡ **Acceso:** Inmediato después del pago

📱 **Más información:** https://landein-page-pian2.vercel.app/

💳 **Métodos de pago disponibles:**
💚 Nequi: 3042748687
💙 Daviplata: 3042748687
🌐 Hotmart: https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205
📱 WhatsApp: +57 304 274 8687

¿Con cuál método prefieres pagar?`,
      
      stock: null // Producto digital, sin stock
    }

    let resultado

    if (cursoExistente) {
      // Actualizar curso existente
      resultado = await prisma.product.update({
        where: { id: cursoExistente.id },
        data: cursoPianoData
      })
      console.log('✅ Curso de Piano actualizado exitosamente')
    } else {
      // Crear nuevo curso (necesita userId)
      const primerUsuario = await prisma.user.findFirst()
      
      if (!primerUsuario) {
        console.log('❌ No hay usuarios en la base de datos')
        console.log('💡 Crea un usuario primero con: npm run create-admin')
        return
      }

      resultado = await prisma.product.create({
        data: {
          ...cursoPianoData,
          userId: primerUsuario.id
        }
      })
      console.log('✅ Curso de Piano creado exitosamente')
    }

    console.log('\n📋 Detalles del producto:')
    console.log(`   ID: ${resultado.id}`)
    console.log(`   Nombre: ${resultado.name}`)
    console.log(`   Precio: $${resultado.price.toLocaleString()} ${resultado.currency}`)
    console.log(`   Categoría: ${resultado.category}`)
    console.log(`   Estado: ${resultado.status}`)
    
    // Mostrar imágenes
    const imagenes = JSON.parse(resultado.images || '[]')
    console.log(`\n🖼️  Imágenes (${imagenes.length}):`)
    imagenes.forEach((img: string, i: number) => {
      console.log(`   ${i + 1}. ${img}`)
    })
    
    // Mostrar tags
    const tags = JSON.parse(resultado.tags || '[]')
    console.log(`\n🏷️  Tags (${tags.length}):`)
    
    // Separar métodos de pago de palabras clave
    const metodosPago = tags.filter((t: string) => t.includes(':'))
    const palabrasClave = tags.filter((t: string) => !t.includes(':'))
    
    console.log('\n   💳 Métodos de pago:')
    metodosPago.forEach((tag: string) => {
      const [tipo, valor] = tag.split(':')
      console.log(`      • ${tipo}: ${valor}`)
    })
    
    console.log('\n   🔍 Palabras clave:')
    console.log(`      ${palabrasClave.join(', ')}`)

    console.log('\n\n🎉 ¡Listo! El curso de piano está completamente configurado.')
    console.log('\n📱 Prueba enviando un mensaje al bot:')
    console.log('   "Hola, tienes disponible el curso de piano?"')
    console.log('\n🌐 Landing page:')
    console.log('   https://landein-page-pian2.vercel.app/')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

actualizarCursoPiano()

/**
 * Script para restaurar productos anteriores con sus fotos
 * Ejecutar con: npx tsx restaurar-productos-con-fotos.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Productos a restaurar con sus fotos originales
const productosARestaurar = [
  {
    name: "Curso Completo de Piano",
    description: "🎵 Curso de Piano Completo: Desde Cero hasta Nivel Avanzado 🎹 ☀️ Aprende los estilos más populares: 🎼 Clásico • 💕 Balada • 🎸 Pop • 🎺 Blues • 🎷 Jazz\n\nTodos los estilos tienen elementos en común, ¡y aprenderás a dominarlos fácilmente! 🧠 Qué aprenderás ✅ Tocar el piano desde el primer momento ✅ Leer partituras con soltura ✅ Acompañar e improvisar como un profesional ✅ Entender la teoría musical de forma simple y práctica ✅ Desarrollar tu propio estilo interpretativo 💡 Método de enseñanza 🎨 He desarrollado un método progresivo para que disfrutes cada paso del aprendizaje 🎧 Lecciones con calidad profesional: Gráficos didácticos 📊 Iluminación y sonido de estudio 💡🎵 Narración clara y precisa 🗣️ 📈 Avanzarás paso a paso sin frustración, ¡y tocando desde el primer día! 📚 Este curso incluye 🎥 19 horas de video bajo demanda 📄 34 artículos complementarios 🎁 157 recursos descargables 📱 Acceso en móviles y TV 📺 Contenido del curso 🌟 19 secciones 📚 283 clases ⏱️ Duración total: 18 h 55 min 🎬 Presentación del curso – 05:51 🎯 Mi plan de enseñanza completo – 04:46 🎹 Requisitos 🚫 No se necesitan conocimientos previos 🎼 Aprende desde cero 🎹 Tocarás el piano desde el primer momento 📖 No necesitas saber leer partituras (¡te enseño cómo hacerlo!) 📝 Descripción del curso Te presento un curso completo de piano, diseñado para que aprendas desde cero hasta un nivel avanzado. Con más de 18 horas de contenido, este curso te guiará paso a paso en el fascinante mundo del piano. 🎹 ¿Qué hace especial a este curso? ✅ Método progresivo: Cada lección está diseñada para que avances de manera natural y sin frustraciones. ✅ Aprende múltiples estilos: Clásico, balada, pop, blues y jazz. ✅ Teoría y práctica: Combina el aprendizaje teórico con ejercicios prácticos desde el primer día. ✅ Recursos descargables: Partituras, ejercicios y material complementario para reforzar tu aprendizaje. ✅ Acceso ilimitado: Aprende a tu propio ritmo, desde cualquier dispositivo. 🎯 ¿Para quién es este curso? ✅ Principiantes absolutos que quieren aprender piano desde cero. ✅ Personas con conocimientos básicos que desean mejorar su técnica. ✅ Amantes de la música que quieren tocar sus canciones favoritas. 🎁 Beneficios adicionales ✅ Certificado de finalización. ✅ Soporte directo del instructor. ✅ Actualizaciones gratuitas del contenido. 🚀 ¡Empieza hoy y descubre el pianista que llevas dentro! 🎹",
    price: 60000,
    currency: "COP",
    category: "DIGITAL",
    status: "AVAILABLE",
    images: [
      "https://img-c.udemycdn.com/course/750x422/5428206_5f0e_2.jpg",
      "https://img-c.udemycdn.com/course/750x422/5428206_5f0e.jpg"
    ],
    tags: ["curso", "piano", "música", "digital", "online", "aprendizaje"],
    stock: 999,
    paymentLinkCustom: "https://pay.hotmart.com/I95497720H?checkoutMode=2&bid=1760738599205"
  },
  // Agrega más productos aquí según necesites
]

async function restaurarProductos() {
  console.log('🔄 Iniciando restauración de productos...\n')
  
  try {
    // Obtener el primer usuario (admin)
    const usuario = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'daveymena16@gmail.com' },
          { email: 'deinermena25@gmail.com' }
        ]
      }
    })

    if (!usuario) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario encontrado: ${usuario.email}\n`)

    let restaurados = 0
    let actualizados = 0
    let errores = 0

    for (const producto of productosARestaurar) {
      try {
        // Verificar si el producto ya existe
        const existente = await prisma.product.findFirst({
          where: {
            name: producto.name,
            userId: usuario.id
          }
        })

        if (existente) {
          // Actualizar producto existente
          await prisma.product.update({
            where: { id: existente.id },
            data: {
              description: producto.description,
              price: producto.price,
              currency: producto.currency,
              category: producto.category,
              status: producto.status,
              images: JSON.stringify(producto.images),
              tags: JSON.stringify(producto.tags),
              stock: producto.stock,
              paymentLinkCustom: producto.paymentLinkCustom
            }
          })
          console.log(`🔄 Actualizado: ${producto.name}`)
          actualizados++
        } else {
          // Crear nuevo producto
          await prisma.product.create({
            data: {
              ...producto,
              images: JSON.stringify(producto.images),
              tags: JSON.stringify(producto.tags),
              userId: usuario.id
            }
          })
          console.log(`✅ Restaurado: ${producto.name}`)
          restaurados++
        }
      } catch (error) {
        console.error(`❌ Error con ${producto.name}:`, error.message)
        errores++
      }
    }

    console.log('\n📊 Resumen:')
    console.log(`✅ Productos restaurados: ${restaurados}`)
    console.log(`🔄 Productos actualizados: ${actualizados}`)
    console.log(`❌ Errores: ${errores}`)
    console.log(`📦 Total procesados: ${productosARestaurar.length}`)

  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
restaurarProductos()

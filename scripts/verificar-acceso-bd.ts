/**
 * 🔍 VERIFICAR ACCESO DEL BOT A LA BASE DE DATOS
 * 
 * Este script verifica que el bot puede:
 * - Conectarse a la base de datos
 * - Buscar productos
 * - Obtener información completa
 * - Acceder al historial
 */

import { db } from '../src/lib/db'
import { ProductIntelligenceService } from '../src/lib/product-intelligence-service'

async function verificarAccesoBD() {
  console.log('🔍 Verificando acceso del bot a la base de datos...\n')

  try {
    // 1. Verificar conexión a BD
    console.log('1️⃣ Verificando conexión a la base de datos...')
    const userCount = await db.user.count()
    console.log(`   ✅ Conexión exitosa - ${userCount} usuario(s) en la BD\n`)

    // 2. Obtener un usuario de prueba
    const user = await db.user.findFirst({
      where: { email: { contains: '@' } }
    })

    if (!user) {
      console.log('   ❌ No se encontró ningún usuario')
      return
    }

    console.log(`   ✅ Usuario encontrado: ${user.email}`)
    console.log(`   📝 ID: ${user.id}\n`)

    // 3. Verificar productos disponibles
    console.log('2️⃣ Verificando productos disponibles...')
    const products = await db.product.findMany({
      where: {
        userId: user.id,
        status: 'AVAILABLE'
      },
      take: 5
    })

    console.log(`   ✅ Productos disponibles: ${products.length}`)
    
    if (products.length > 0) {
      console.log('\n   📦 Productos encontrados:')
      products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`)
        console.log(`      💰 Precio: $${p.price.toLocaleString('es-CO')}`)
        console.log(`      📝 Descripción: ${p.description?.substring(0, 50)}...`)
        console.log(`      📦 Stock: ${p.stock || 'N/A'}`)
        console.log('')
      })
    } else {
      console.log('   ⚠️  No hay productos disponibles')
      console.log('   💡 Agrega productos desde el dashboard para que el bot pueda venderlos\n')
    }

    // 4. Probar búsqueda de productos
    if (products.length > 0) {
      console.log('3️⃣ Probando búsqueda de productos...')
      
      const searchTerms = ['laptop', 'curso', 'moto', products[0].name.split(' ')[0]]
      
      for (const term of searchTerms) {
        console.log(`\n   🔍 Buscando: "${term}"`)
        
        try {
          const found = await ProductIntelligenceService.findProduct(term, user.id)
          
          if (found) {
            console.log(`   ✅ Producto encontrado: ${found.name}`)
            console.log(`      💰 Precio: $${found.price.toLocaleString('es-CO')}`)
          } else {
            console.log(`   ℹ️  No se encontró producto con "${term}"`)
          }
        } catch (error) {
          console.log(`   ⚠️  Error en búsqueda: ${error}`)
        }
      }
    }

    // 5. Verificar conversaciones
    console.log('\n4️⃣ Verificando historial de conversaciones...')
    const conversations = await db.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      },
      take: 3
    })

    console.log(`   ✅ Conversaciones encontradas: ${conversations.length}`)
    
    if (conversations.length > 0) {
      console.log('\n   💬 Últimas conversaciones:')
      conversations.forEach((conv, i) => {
        console.log(`   ${i + 1}. Cliente: ${conv.customerPhone}`)
        console.log(`      📅 Fecha: ${conv.createdAt.toLocaleString('es-CO')}`)
        console.log(`      📊 Estado: ${conv.status}`)
        console.log(`      💬 Mensajes: ${conv.messages.length}`)
        
        if (conv.messages.length > 0) {
          const lastMsg = conv.messages[0]
          console.log(`      📝 Último mensaje: "${lastMsg.content.substring(0, 50)}..."`)
        }
        console.log('')
      })
    } else {
      console.log('   ℹ️  No hay conversaciones registradas aún')
    }

    // 6. Verificar configuración del bot
    console.log('5️⃣ Verificando configuración del bot...')
    const botSettings = await db.botSettings.findUnique({
      where: { userId: user.id }
    })

    if (botSettings) {
      console.log(`   ✅ Configuración encontrada`)
      console.log(`   📝 Nombre del negocio: ${botSettings.businessName}`)
      console.log(`   📞 Teléfono: ${botSettings.businessPhone}`)
      console.log(`   🎭 Personalidad: ${botSettings.botPersonality ? 'Configurada' : 'Por defecto'}`)
      console.log(`   ⚙️  Respuesta automática: ${botSettings.autoResponseEnabled ? 'Activada' : 'Desactivada'}`)
    } else {
      console.log('   ℹ️  No hay configuración personalizada')
    }

    // 7. Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE VERIFICACIÓN')
    console.log('='.repeat(60))
    console.log(`✅ Conexión a BD: OK`)
    console.log(`✅ Usuario encontrado: ${user.email}`)
    console.log(`✅ Productos disponibles: ${products.length}`)
    console.log(`✅ Conversaciones registradas: ${conversations.length}`)
    console.log(`✅ Configuración del bot: ${botSettings ? 'OK' : 'Por defecto'}`)
    console.log('')
    console.log('🎉 El bot tiene acceso completo a la base de datos!')
    console.log('')
    console.log('💡 Próximos pasos:')
    if (products.length === 0) {
      console.log('   1. Agrega productos desde el dashboard')
      console.log('   2. El bot podrá buscarlos y venderlos automáticamente')
    } else {
      console.log('   1. Prueba el bot enviando un mensaje por WhatsApp')
      console.log('   2. Pregunta por alguno de los productos listados arriba')
      console.log('   3. El bot buscará en la BD y responderá con información real')
    }
    console.log('')

  } catch (error) {
    console.error('❌ Error verificando acceso a BD:', error)
  } finally {
    await db.$disconnect()
  }
}

// Ejecutar verificación
verificarAccesoBD()

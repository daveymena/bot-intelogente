/**
 * Script para probar si el bot está respondiendo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testBot() {
  try {
    console.log('🔍 DIAGNÓSTICO DEL BOT\n')

    // 1. Verificar conexión de WhatsApp
    console.log('1️⃣ Verificando conexión de WhatsApp...')
    const conexion = await prisma.whatsAppConnection.findFirst()
    
    if (!conexion) {
      console.log('❌ No hay conexión de WhatsApp registrada')
      console.log('   Solución: Conecta WhatsApp desde el dashboard')
      return
    }

    console.log(`✅ Conexión encontrada:`)
    console.log(`   Estado: ${conexion.status}`)
    console.log(`   Conectado: ${conexion.isConnected ? 'SÍ' : 'NO'}`)
    console.log(`   Teléfono: ${conexion.phoneNumber}`)

    if (conexion.status !== 'CONNECTED' || !conexion.isConnected) {
      console.log('\n❌ WhatsApp NO está conectado')
      console.log('   Solución: Reconecta WhatsApp desde el dashboard')
      return
    }

    // 2. Verificar mensajes recientes
    console.log('\n2️⃣ Verificando mensajes recientes...')
    const mensajesRecientes = await prisma.message.findMany({
      include: {
        conversation: {
          select: {
            customerName: true,
            customerPhone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    if (mensajesRecientes.length === 0) {
      console.log('⚠️ No hay mensajes en la base de datos')
      console.log('   Esto significa que:')
      console.log('   - Los mensajes no están llegando al bot')
      console.log('   - O el manejador de mensajes no está funcionando')
    } else {
      console.log(`✅ Últimos ${mensajesRecientes.length} mensajes:`)
      mensajesRecientes.forEach((msg, i) => {
        const direccion = msg.direction === 'INCOMING' ? '📥 Entrante' : '📤 Saliente'
        console.log(`\n   ${i + 1}. ${direccion} - ${msg.conversation.customerName}`)
        console.log(`      "${msg.content.substring(0, 50)}..."`)
        console.log(`      ${msg.createdAt.toLocaleString('es-ES')}`)
      })

      // Verificar si hay respuestas
      const respuestas = mensajesRecientes.filter(m => m.direction === 'OUTGOING')
      if (respuestas.length === 0) {
        console.log('\n❌ NO hay mensajes salientes (respuestas del bot)')
        console.log('   El bot está recibiendo mensajes pero NO está respondiendo')
      } else {
        console.log(`\n✅ El bot SÍ está respondiendo (${respuestas.length} respuestas)`)
      }
    }

    // 3. Verificar configuración de IA
    console.log('\n3️⃣ Verificando configuración de IA...')
    if (!process.env.GROQ_API_KEY) {
      console.log('❌ GROQ_API_KEY no está configurada en .env')
      console.log('   El bot NO puede generar respuestas sin esta API key')
      return
    }
    console.log('✅ GROQ_API_KEY configurada')

    // 4. Verificar productos
    console.log('\n4️⃣ Verificando catálogo de productos...')
    const totalProductos = await prisma.product.count()
    console.log(`✅ ${totalProductos} productos en el catálogo`)

    // 5. Verificar usuario
    console.log('\n5️⃣ Verificando usuario...')
    const usuario = await prisma.user.findUnique({
      where: { id: conexion.userId }
    })
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado')
      return
    }
    console.log(`✅ Usuario: ${usuario.email}`)

    // RESUMEN
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DEL DIAGNÓSTICO')
    console.log('='.repeat(50))

    const problemas = []
    
    if (conexion.status !== 'CONNECTED') {
      problemas.push('WhatsApp no está conectado')
    }
    
    if (mensajesRecientes.length === 0) {
      problemas.push('No hay mensajes en la base de datos')
    }
    
    const respuestas = mensajesRecientes.filter(m => m.direction === 'OUTGOING')
    if (mensajesRecientes.length > 0 && respuestas.length === 0) {
      problemas.push('El bot recibe mensajes pero NO responde')
    }

    if (!process.env.GROQ_API_KEY) {
      problemas.push('GROQ_API_KEY no configurada')
    }

    if (problemas.length === 0) {
      console.log('\n✅ TODO ESTÁ FUNCIONANDO CORRECTAMENTE')
      console.log('\nSi aún no recibes respuestas:')
      console.log('1. Verifica los logs del servidor (consola donde corre npm run dev)')
      console.log('2. Busca errores en los logs')
      console.log('3. Reinicia el servidor')
    } else {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:')
      problemas.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p}`)
      })
      
      console.log('\n🔧 SOLUCIONES:')
      if (problemas.includes('WhatsApp no está conectado')) {
        console.log('   - Ve al dashboard y reconecta WhatsApp')
      }
      if (problemas.includes('El bot recibe mensajes pero NO responde')) {
        console.log('   - Revisa los logs del servidor para ver errores')
        console.log('   - Verifica que el manejador de mensajes esté activo')
        console.log('   - Reinicia el servidor: npm run dev')
      }
      if (problemas.includes('GROQ_API_KEY no configurada')) {
        console.log('   - Agrega GROQ_API_KEY en el archivo .env')
      }
    }

    console.log('\n' + '='.repeat(50))

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBot()

import { PrismaClient } from '@prisma/client'
import { AIService } from '../src/lib/ai-service'
import { ConversationContextService } from '../src/lib/conversation-context-service'

const prisma = new PrismaClient()

async function testMemoriaContexto() {
  console.log('🧠 PRUEBA DE MEMORIA DE CONTEXTO\n')
  console.log('=' .repeat(60))

  try {
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No hay usuarios')
      return
    }

    const customerPhone = '6988129931330@lid'
    console.log(`✅ Usuario: ${user.email}`)
    console.log(`📱 Cliente: ${customerPhone}\n`)

    // CASO 1: Pregunta inicial con producto
    console.log('📝 CASO 1: Pregunta inicial')
    console.log('-'.repeat(60))
    const msg1 = 'Me interesa la moto Bajaj'
    console.log(`Cliente: "${msg1}"`)
    
    const resp1 = await AIService.generateResponse(user.id, msg1, customerPhone, [])
    console.log(`Bot: ${resp1.message.substring(0, 100)}...`)
    console.log(`Memoria: ${ConversationContextService.getStats().total} contextos activos\n`)

    // CASO 2: Pregunta SIN palabra clave (solo pronombre)
    console.log('📝 CASO 2: Pregunta con pronombre (sin palabra clave)')
    console.log('-'.repeat(60))
    const msg2 = 'Cuánto cuesta?'
    console.log(`Cliente: "${msg2}"`)
    
    const historial = [
      { role: 'user' as const, content: msg1 },
      { role: 'assistant' as const, content: resp1.message }
    ]
    
    const resp2 = await AIService.generateResponse(user.id, msg2, customerPhone, historial)
    console.log(`Bot: ${resp2.message.substring(0, 100)}...`)
    
    if (resp2.message.toLowerCase().includes('moto') || resp2.message.toLowerCase().includes('bajaj')) {
      console.log('✅ CORRECTO: Mantiene contexto de la moto')
    } else {
      console.log('❌ ERROR: Perdió el contexto')
    }
    console.log(`Memoria: ${ConversationContextService.getStats().total} contextos activos\n`)

    // CASO 3: Otra pregunta sin palabra clave
    console.log('📝 CASO 3: Pregunta sobre disponibilidad (sin mencionar producto)')
    console.log('-'.repeat(60))
    const msg3 = 'Está disponible?'
    console.log(`Cliente: "${msg3}"`)
    
    historial.push(
      { role: 'user', content: msg2 },
      { role: 'assistant', content: resp2.message }
    )
    
    const resp3 = await AIService.generateResponse(user.id, msg3, customerPhone, historial)
    console.log(`Bot: ${resp3.message.substring(0, 100)}...`)
    
    if (resp3.message.toLowerCase().includes('moto') || resp3.message.toLowerCase().includes('bajaj')) {
      console.log('✅ CORRECTO: Mantiene contexto de la moto')
    } else {
      console.log('❌ ERROR: Perdió el contexto')
    }
    console.log(`Memoria: ${ConversationContextService.getStats().total} contextos activos\n`)

    // CASO 4: Pregunta muy genérica
    console.log('📝 CASO 4: Pregunta muy genérica')
    console.log('-'.repeat(60))
    const msg4 = 'Tiene garantía?'
    console.log(`Cliente: "${msg4}"`)
    
    historial.push(
      { role: 'user', content: msg3 },
      { role: 'assistant', content: resp3.message }
    )
    
    const resp4 = await AIService.generateResponse(user.id, msg4, customerPhone, historial)
    console.log(`Bot: ${resp4.message.substring(0, 100)}...`)
    
    if (resp4.message.toLowerCase().includes('moto') || resp4.message.toLowerCase().includes('bajaj')) {
      console.log('✅ CORRECTO: Mantiene contexto de la moto')
    } else {
      console.log('❌ ERROR: Perdió el contexto')
    }
    console.log(`Memoria: ${ConversationContextService.getStats().total} contextos activos\n`)

    // CASO 5: Cambio de producto
    console.log('📝 CASO 5: Cambio de producto (menciona laptop)')
    console.log('-'.repeat(60))
    const msg5 = 'Y qué laptops tienes?'
    console.log(`Cliente: "${msg5}"`)
    
    historial.push(
      { role: 'user', content: msg4 },
      { role: 'assistant', content: resp4.message }
    )
    
    const resp5 = await AIService.generateResponse(user.id, msg5, customerPhone, historial)
    console.log(`Bot: ${resp5.message.substring(0, 100)}...`)
    
    if (resp5.message.toLowerCase().includes('laptop') || resp5.message.toLowerCase().includes('asus')) {
      console.log('✅ CORRECTO: Cambió contexto a laptop')
    } else {
      console.log('⚠️ ADVERTENCIA: No detectó cambio de producto')
    }
    console.log(`Memoria: ${ConversationContextService.getStats().total} contextos activos\n`)

    // CASO 6: Pregunta sobre el nuevo producto
    console.log('📝 CASO 6: Pregunta sobre el nuevo producto (laptop)')
    console.log('-'.repeat(60))
    const msg6 = 'Cuánto vale?'
    console.log(`Cliente: "${msg6}"`)
    
    historial.push(
      { role: 'user', content: msg5 },
      { role: 'assistant', content: resp5.message }
    )
    
    const resp6 = await AIService.generateResponse(user.id, msg6, customerPhone, historial)
    console.log(`Bot: ${resp6.message.substring(0, 100)}...`)
    
    if (resp6.message.toLowerCase().includes('laptop') || resp6.message.toLowerCase().includes('asus')) {
      console.log('✅ CORRECTO: Mantiene nuevo contexto (laptop)')
    } else if (resp6.message.toLowerCase().includes('moto')) {
      console.log('❌ ERROR: Volvió al contexto anterior (moto)')
    } else {
      console.log('⚠️ ADVERTENCIA: No tiene contexto claro')
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 ESTADÍSTICAS FINALES')
    console.log('-'.repeat(60))
    
    const stats = ConversationContextService.getStats()
    console.log(`Total de contextos activos: ${stats.total}`)
    stats.contexts.forEach(ctx => {
      console.log(`  📌 ${ctx.key}`)
      console.log(`     Producto: ${ctx.product}`)
      console.log(`     Mensajes: ${ctx.messages}`)
    })

    console.log('\n' + '='.repeat(60))
    console.log('✅ PRUEBA COMPLETADA')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMemoriaContexto()

/**
 * 🧪 TEST: Verificar que el sistema híbrido usa correctamente la memoria de contexto
 * 
 * Escenario:
 * 1. Cliente: "Busco un curso de piano"
 * 2. Bot: Muestra el curso de piano
 * 3. Cliente: "Envíame los detalles" ← Debe entender que se refiere al curso de piano
 */

import { ProfessionalConversationMemory } from '../src/lib/professional-conversation-memory'
import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testMemoriaContexto() {
    console.log('🧪 TEST: Memoria de Contexto en Sistema Híbrido\n')
    console.log('=' .repeat(60))

    const userId = 'test-user'
    const from = '573001234567'
    const conversationKey = `${userId}:${from}`

    // Limpiar memoria previa
    ProfessionalConversationMemory.clearMemory(conversationKey)

    // Crear sistema híbrido
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
        console.error('❌ GROQ_API_KEY no configurada')
        return
    }

    const hybridSystem = await createGroqHybridSystem(groqApiKey)

    // PASO 1: Cliente busca curso de piano
    console.log('\n📝 PASO 1: Cliente busca curso de piano')
    console.log('-'.repeat(60))
    console.log('Cliente: "Busco un curso de piano"')
    
    const response1 = await hybridSystem.processMessage(
        'Busco un curso de piano',
        userId,
        [],
        from
    )
    
    console.log('\n🤖 Bot:', response1)

    // Verificar que se guardó en memoria
    const memory1 = ProfessionalConversationMemory.getMemory(conversationKey)
    console.log('\n💾 Memoria después del paso 1:')
    console.log('- Producto actual:', memory1?.currentProduct?.name || 'ninguno')
    console.log('- Productos en historial:', memory1?.productHistory?.length || 0)

    // PASO 2: Cliente pide más detalles (sin mencionar el producto)
    console.log('\n📝 PASO 2: Cliente pide más detalles')
    console.log('-'.repeat(60))
    console.log('Cliente: "Envíame los detalles"')

    const conversationHistory = [
        { role: 'user', content: 'Busco un curso de piano' },
        { role: 'assistant', content: response1 }
    ]

    const response2 = await hybridSystem.processMessage(
        'Envíame los detalles',
        userId,
        conversationHistory,
        from
    )

    console.log('\n🤖 Bot:', response2)

    // Verificar que la respuesta es sobre el curso de piano
    const mencionaCursoPiano = 
        response2.toLowerCase().includes('piano') ||
        response2.toLowerCase().includes('curso')

    console.log('\n✅ RESULTADO:')
    if (mencionaCursoPiano) {
        console.log('✅ El bot entendió que se refiere al curso de piano')
        console.log('✅ La memoria de contexto está funcionando correctamente')
    } else {
        console.log('❌ El bot NO entendió que se refiere al curso de piano')
        console.log('❌ La memoria de contexto NO está funcionando')
        console.log('\n🔍 Respuesta del bot:', response2)
    }

    // PASO 3: Cliente pregunta por precio (sin mencionar el producto)
    console.log('\n📝 PASO 3: Cliente pregunta por precio')
    console.log('-'.repeat(60))
    console.log('Cliente: "¿Cuánto cuesta?"')

    conversationHistory.push(
        { role: 'user', content: 'Envíame los detalles' },
        { role: 'assistant', content: response2 }
    )

    const response3 = await hybridSystem.processMessage(
        '¿Cuánto cuesta?',
        userId,
        conversationHistory,
        from
    )

    console.log('\n🤖 Bot:', response3)

    // Verificar que menciona el precio del curso de piano
    const mencionaPrecio = 
        response3.includes('$') ||
        response3.toLowerCase().includes('precio') ||
        response3.toLowerCase().includes('cuesta')

    console.log('\n✅ RESULTADO:')
    if (mencionaPrecio && mencionaCursoPiano) {
        console.log('✅ El bot mantiene el contexto del curso de piano')
        console.log('✅ La memoria persiste a través de múltiples mensajes')
    } else {
        console.log('❌ El bot perdió el contexto')
        console.log('\n🔍 Respuesta del bot:', response3)
    }

    // Mostrar memoria final
    const memoryFinal = ProfessionalConversationMemory.getMemory(conversationKey)
    console.log('\n💾 MEMORIA FINAL:')
    console.log(JSON.stringify(memoryFinal, null, 2))

    console.log('\n' + '='.repeat(60))
    console.log('🏁 TEST COMPLETADO')
}

// Ejecutar test
testMemoriaContexto().catch(console.error)

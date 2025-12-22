import { advancedConversationService } from '../src/lib/advanced-conversation-service'

const service = advancedConversationService

async function testMegapacksConversation() {
    console.log('\n════════════════════════════════════════════════════════════════════════════════')
    console.log('🎯 PRUEBA: Conversación sobre Megapacks')
    console.log('════════════════════════════════════════════════════════════════════════════════\n')

    const scenarios = [
        {
            name: 'Cliente pregunta por cursos',
            messages: [
                'Hola',
                'Tienen cursos?',
                'Cuánto cuestan?',
                'Muy caro',
                'Qué incluye el pack completo?',
                'Cómo pago?'
            ]
        },
        {
            name: 'Cliente pregunta por megapacks',
            messages: [
                'Buenos días',
                'Tienen megapacks?',
                'Cuánto vale el pack completo?',
                'Qué megapacks incluye?',
                'Me interesa, cómo pago?'
            ]
        },
        {
            name: 'Cliente busca curso específico',
            messages: [
                'Hola',
                'Tienen cursos de diseño gráfico?',
                'Y de Excel?',
                'Cuánto cuestan?',
                'Puedo comprar solo uno?',
                'Formas de pago?'
            ]
        }
    ]

    for (const scenario of scenarios) {
        console.log(`📋 ESCENARIO: ${scenario.name}\n`)

        const conversationId = `test-${Date.now()}`
        const phoneNumber = '+573001234567'

        for (const message of scenario.messages) {
            console.log(`👤 CLIENTE: ${message}`)

            const response = await service.processMessage(phoneNumber, message)

            console.log(`🤖 BOT: ${response}`)
            console.log('────────────────────────────────────────────────────────────────────────────────\n')

            // Pequeña pausa para simular conversación real
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        console.log('\n')
    }

    console.log('════════════════════════════════════════════════════════════════════════════════')
    console.log('✅ PRUEBAS COMPLETADAS')
    console.log('════════════════════════════════════════════════════════════════════════════════\n')
}

testMegapacksConversation()

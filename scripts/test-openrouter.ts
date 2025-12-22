import 'dotenv/config'

async function testOpenRouter() {
    console.log('\n════════════════════════════════════════════════════════════════════════════════')
    console.log('🧪 PRUEBA: OpenRouter API')
    console.log('════════════════════════════════════════════════════════════════════════════════\n')

    const apiKey = process.env.OPENROUTER_API_KEY
    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'

    console.log('📋 Configuración:')
    console.log(`API Key: ${apiKey ? '✅ Configurada' : '❌ No configurada'}`)
    console.log(`Modelo: ${model}`)
    console.log('')

    if (!apiKey) {
        console.log('❌ Error: OPENROUTER_API_KEY no está configurada en .env')
        return
    }

    try {
        console.log('🚀 Enviando mensaje de prueba...\n')

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Bot WhatsApp Test'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un asistente de ventas profesional y amigable.'
                    },
                    {
                        role: 'user',
                        content: 'Hola, ¿tienes laptops disponibles?'
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        })

        if (!response.ok) {
            const error = await response.text()
            console.log('❌ Error en la respuesta:')
            console.log(`Status: ${response.status}`)
            console.log(`Error: ${error}`)
            return
        }

        const data = await response.json()
        
        console.log('✅ Respuesta recibida exitosamente!\n')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('💬 RESPUESTA DEL BOT:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(data.choices[0].message.content)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

        console.log('📊 Estadísticas:')
        console.log(`Modelo usado: ${data.model}`)
        console.log(`Tokens usados: ${data.usage?.total_tokens || 'N/A'}`)
        console.log(`Tiempo de respuesta: ${data.usage?.completion_time || 'N/A'}`)
        
        console.log('\n✅ OpenRouter está funcionando correctamente!')
        console.log('🎉 Puedes usar este proveedor de IA en tu bot\n')

    } catch (error) {
        console.log('❌ Error al conectar con OpenRouter:')
        console.log(error)
    }
}

testOpenRouter()

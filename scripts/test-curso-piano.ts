/**
 * 🧪 TEST: Búsqueda de curso de piano
 */

import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testCursoPiano() {
    console.log('🧪 TEST: Búsqueda de Curso de Piano\n')

    const groqApiKey = process.env.GROQ_API_KEY || ''
    if (!groqApiKey) {
        console.log('❌ GROQ_API_KEY no configurada')
        return
    }

    const hybridSystem = await createGroqHybridSystem(groqApiKey)
    // Usar el userId real de los productos
    const userId = 'cmhpw941q0000kmp85qvjm0o5'

    const testCases = [
        'curso de piano',
        'busco curso de piano',
        'quiero el curso de piano',
        'info del curso de piano'
    ]

    for (const message of testCases) {
        console.log(`\n${'='.repeat(60)}`)
        console.log(`📝 Mensaje: "${message}"`)
        console.log('='.repeat(60))
        
        try {
            const response = await hybridSystem.processMessage(
                message,
                userId,
                []
            )

            console.log(`\n✅ Respuesta:`)
            console.log(response)

            // Verificar si menciona el curso
            const mencionaCurso = response.toLowerCase().includes('curso') && 
                                  response.toLowerCase().includes('piano')
            
            const esPregunta = response.includes('¿') || response.includes('?')
            
            console.log(`\n📊 Análisis:`)
            console.log(`   - Menciona curso de piano: ${mencionaCurso ? 'SÍ' : 'NO'}`)
            console.log(`   - Es pregunta de calificación: ${esPregunta ? 'SÍ' : 'NO'}`)

        } catch (error: any) {
            console.log(`\n❌ Error: ${error.message}`)
        }
    }
}

testCursoPiano()
    .then(() => {
        console.log('\n✅ Test completado')
        process.exit(0)
    })
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })

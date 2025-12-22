/**
 * 🧪 TEST: Sistema de calificación
 * Verificar que el bot haga preguntas antes de mostrar productos
 */

import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testCalificacion() {
    console.log('🧪 TEST: Sistema de Calificación\n')
    console.log('=' .repeat(60))

    const groqApiKey = process.env.GROQ_API_KEY || ''
    if (!groqApiKey) {
        console.log('❌ GROQ_API_KEY no configurada')
        return
    }

    const hybridSystem = await createGroqHybridSystem(groqApiKey)
    const userId = 'test-user'

    // Casos de prueba
    const testCases = [
        {
            name: 'Búsqueda general de portátil',
            message: 'busco un portátil',
            shouldQualify: true
        },
        {
            name: 'Búsqueda general de laptop',
            message: 'quiero una laptop',
            shouldQualify: true
        },
        {
            name: 'Búsqueda específica con uso',
            message: 'busco un portátil para gaming',
            shouldQualify: false
        },
        {
            name: 'Búsqueda específica con marca',
            message: 'busco un portátil asus',
            shouldQualify: false
        },
        {
            name: 'Búsqueda específica con presupuesto',
            message: 'busco un portátil hasta 2 millones',
            shouldQualify: false
        },
        {
            name: 'Búsqueda general de celular',
            message: 'necesito un celular',
            shouldQualify: true
        },
        {
            name: 'Búsqueda general de curso',
            message: 'busco cursos',
            shouldQualify: true
        }
    ]

    for (const testCase of testCases) {
        console.log(`\n📝 ${testCase.name}`)
        console.log(`   Mensaje: "${testCase.message}"`)
        console.log(`   Debe calificar: ${testCase.shouldQualify ? 'SÍ' : 'NO'}`)
        
        try {
            const response = await hybridSystem.processMessage(
                testCase.message,
                userId,
                []
            )

            // Verificar si la respuesta es una pregunta de calificación
            const isQualificationQuestion = 
                response.includes('¿Para qué') ||
                response.includes('¿Qué tipo') ||
                response.includes('¿Qué buscas') ||
                response.includes('1️⃣') ||
                response.includes('2️⃣')

            const result = testCase.shouldQualify === isQualificationQuestion ? '✅' : '❌'
            
            console.log(`   ${result} Resultado: ${isQualificationQuestion ? 'PREGUNTA' : 'PRODUCTOS'}`)
            console.log(`   Respuesta: ${response.substring(0, 100)}...`)

        } catch (error: any) {
            console.log(`   ❌ Error: ${error.message}`)
        }
    }

    console.log('\n' + '='.repeat(60))
}

testCalificacion()
    .then(() => {
        console.log('\n✅ Test completado')
        process.exit(0)
    })
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })

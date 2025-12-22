/**
 * 🧪 TEST: Sistema de calificación mejorado
 * Verificar que NO pregunte cuando ya es específico
 */

import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testCalificacionMejorada() {
    console.log('🧪 TEST: Sistema de Calificación Mejorado\n')
    console.log('=' .repeat(70))

    const groqApiKey = process.env.GROQ_API_KEY || ''
    if (!groqApiKey) {
        console.log('❌ GROQ_API_KEY no configurada')
        return
    }

    const hybridSystem = await createGroqHybridSystem(groqApiKey)
    const userId = 'cmhpw941q0000kmp85qvjm0o5'

    const testCases = [
        // PRODUCTOS FÍSICOS - Generales (SÍ debe calificar)
        {
            name: 'Portátil general',
            message: 'busco un portátil',
            shouldQualify: true,
            category: 'FÍSICO'
        },
        {
            name: 'Laptop general',
            message: 'quiero una laptop',
            shouldQualify: true,
            category: 'FÍSICO'
        },
        {
            name: 'Celular general',
            message: 'necesito un celular',
            shouldQualify: true,
            category: 'FÍSICO'
        },
        
        // PRODUCTOS FÍSICOS - Específicos (NO debe calificar)
        {
            name: 'Portátil con marca',
            message: 'busco un portátil asus',
            shouldQualify: false,
            category: 'FÍSICO'
        },
        {
            name: 'Portátil con uso',
            message: 'busco un portátil para gaming',
            shouldQualify: false,
            category: 'FÍSICO'
        },
        {
            name: 'Portátil con especificaciones',
            message: 'busco un portátil ryzen 5 con 16gb ram',
            shouldQualify: false,
            category: 'FÍSICO'
        },
        {
            name: 'Portátil con presupuesto',
            message: 'busco un portátil hasta 2 millones',
            shouldQualify: false,
            category: 'FÍSICO'
        },
        
        // PRODUCTOS DIGITALES - Generales (SÍ debe calificar)
        {
            name: 'Cursos general',
            message: 'busco cursos',
            shouldQualify: true,
            category: 'DIGITAL'
        },
        
        // PRODUCTOS DIGITALES - Específicos (NO debe calificar)
        {
            name: 'Curso específico',
            message: 'curso de piano',
            shouldQualify: false,
            category: 'DIGITAL'
        },
        {
            name: 'Curso específico 2',
            message: 'busco curso de inglés',
            shouldQualify: false,
            category: 'DIGITAL'
        },
        {
            name: 'Megapack',
            message: 'quiero un megapack',
            shouldQualify: false,
            category: 'DIGITAL'
        }
    ]

    let passed = 0
    let failed = 0

    for (const testCase of testCases) {
        console.log(`\n${'─'.repeat(70)}`)
        console.log(`📝 ${testCase.name} [${testCase.category}]`)
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
                response.includes('2️⃣') ||
                response.includes('¿Cuál te llama')

            const isCorrect = testCase.shouldQualify === isQualificationQuestion
            
            if (isCorrect) {
                passed++
                console.log(`   ✅ CORRECTO: ${isQualificationQuestion ? 'Preguntó' : 'No preguntó'}`)
            } else {
                failed++
                console.log(`   ❌ INCORRECTO: ${isQualificationQuestion ? 'Preguntó' : 'No preguntó'} (debería ${testCase.shouldQualify ? 'preguntar' : 'no preguntar'})`)
            }
            
            console.log(`   Respuesta: ${response.substring(0, 80)}...`)

        } catch (error: any) {
            failed++
            console.log(`   ❌ Error: ${error.message}`)
        }
    }

    console.log('\n' + '='.repeat(70))
    console.log(`\n📊 RESULTADOS:`)
    console.log(`   ✅ Correctos: ${passed}/${testCases.length}`)
    console.log(`   ❌ Incorrectos: ${failed}/${testCases.length}`)
    console.log(`   📈 Porcentaje: ${((passed / testCases.length) * 100).toFixed(1)}%`)
}

testCalificacionMejorada()
    .then(() => {
        console.log('\n✅ Test completado')
        process.exit(0)
    })
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })

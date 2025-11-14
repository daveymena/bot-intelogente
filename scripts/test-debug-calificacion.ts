/**
 * 🐛 DEBUG: Por qué no está calificando cuando dice "busco un portátil"
 */

import { createGroqHybridSystem } from '../src/lib/hybrid-intelligent-response-system'

async function testDebug() {
    console.log('🐛 DEBUG: Calificación de "busco un portátil"\n')

    const groqApiKey = process.env.GROQ_API_KEY || ''
    if (!groqApiKey) {
        console.log('❌ GROQ_API_KEY no configurada')
        return
    }

    const hybridSystem = await createGroqHybridSystem(groqApiKey)
    const userId = 'cmhpw941q0000kmp85qvjm0o5'

    const message = 'busco un portátil'

    console.log(`📝 Mensaje: "${message}"`)
    console.log(`👤 UserId: ${userId}`)
    console.log('\n' + '='.repeat(60))

    try {
        const response = await hybridSystem.processMessage(
            message,
            userId,
            []
        )

        console.log('\n' + '='.repeat(60))
        console.log('\n📤 RESPUESTA DEL BOT:')
        console.log(response)
        console.log('\n' + '='.repeat(60))

        // Analizar la respuesta
        const isPregunta = response.includes('¿') || response.includes('?')
        const muestraProductos = response.includes('💻') || response.includes('Portátil') || response.includes('$')
        
        console.log('\n📊 ANÁLISIS:')
        console.log(`   - Es pregunta: ${isPregunta ? 'SÍ' : 'NO'}`)
        console.log(`   - Muestra productos: ${muestraProductos ? 'SÍ' : 'NO'}`)
        
        if (muestraProductos && !isPregunta) {
            console.log('\n❌ PROBLEMA: Está mostrando productos sin preguntar primero')
        } else if (isPregunta && !muestraProductos) {
            console.log('\n✅ CORRECTO: Está preguntando antes de mostrar productos')
        } else if (isPregunta && muestraProductos) {
            console.log('\n⚠️ MIXTO: Muestra productos Y pregunta (debería solo preguntar)')
        }

    } catch (error: any) {
        console.log(`\n❌ Error: ${error.message}`)
        console.error(error)
    }
}

testDebug()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err)
        process.exit(1)
    })

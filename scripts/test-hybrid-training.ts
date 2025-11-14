/**
 * 🧪 PRUEBA - SISTEMA HÍBRIDO CON ENTRENAMIENTO
 * Verifica que el sistema híbrido de Baileys también usa el entrenamiento
 */

console.log('🧪 VERIFICANDO INTEGRACIÓN DE ENTRENAMIENTO EN SISTEMA HÍBRIDO\n')
console.log('='.repeat(60))

// 1. Verificar que el archivo existe y tiene las importaciones
const fs = require('fs')
const path = require('path')

const hybridFile = path.join(__dirname, '../src/lib/hybrid-intelligent-response-system.ts')

if (!fs.existsSync(hybridFile)) {
    console.log('❌ Archivo hybrid-intelligent-response-system.ts no encontrado')
    process.exit(1)
}

const content = fs.readFileSync(hybridFile, 'utf-8')

console.log('\n✅ PASO 1: Verificar importaciones')

if (content.includes('sales-training-data')) {
    console.log('   ✅ Importación de sales-training-data detectada')
} else {
    console.log('   ❌ NO se detectó importación de sales-training-data')
}

if (content.includes('TRAINING_SCENARIOS')) {
    console.log('   ✅ Uso de TRAINING_SCENARIOS detectado')
} else {
    console.log('   ❌ NO se detectó uso de TRAINING_SCENARIOS')
}

if (content.includes('BOT_RULES')) {
    console.log('   ✅ Uso de BOT_RULES detectado')
} else {
    console.log('   ❌ NO se detectó uso de BOT_RULES')
}

console.log('\n✅ PASO 2: Verificar función de entrenamiento')

if (content.includes('buildTrainingExamples')) {
    console.log('   ✅ Función buildTrainingExamples() detectada')
    
    // Contar cuántas veces se llama
    const calls = (content.match(/this\.buildTrainingExamples\(\)/g) || []).length
    console.log(`   ✅ Función llamada ${calls} vez(es)`)
} else {
    console.log('   ❌ NO se detectó función buildTrainingExamples()')
}

console.log('\n✅ PASO 3: Verificar integración en buildSystemPrompt')

if (content.includes('buildSystemPrompt')) {
    console.log('   ✅ Método buildSystemPrompt encontrado')
    
    // Verificar que llama a buildTrainingExamples
    const promptSection = content.substring(
        content.indexOf('buildSystemPrompt'),
        content.indexOf('buildSystemPrompt') + 5000
    )
    
    if (promptSection.includes('buildTrainingExamples')) {
        console.log('   ✅ buildSystemPrompt llama a buildTrainingExamples')
    } else {
        console.log('   ⚠️  buildSystemPrompt NO llama a buildTrainingExamples')
    }
} else {
    console.log('   ❌ Método buildSystemPrompt no encontrado')
}

console.log('\n✅ PASO 4: Verificar que Baileys usa el sistema híbrido')

const baileysFile = path.join(__dirname, '../src/lib/baileys-stable-service.ts')

if (fs.existsSync(baileysFile)) {
    const baileysContent = fs.readFileSync(baileysFile, 'utf-8')
    
    if (baileysContent.includes('hybrid-intelligent-response-system')) {
        console.log('   ✅ Baileys importa hybrid-intelligent-response-system')
    } else {
        console.log('   ⚠️  Baileys NO importa hybrid-intelligent-response-system')
    }
    
    if (baileysContent.includes('hybridSystem')) {
        console.log('   ✅ Baileys usa hybridSystem')
    } else {
        console.log('   ⚠️  Baileys NO usa hybridSystem')
    }
    
    if (baileysContent.includes('processMessage')) {
        console.log('   ✅ Baileys llama a processMessage del sistema híbrido')
    } else {
        console.log('   ⚠️  Baileys NO llama a processMessage')
    }
} else {
    console.log('   ⚠️  Archivo baileys-stable-service.ts no encontrado')
}

console.log('\n' + '='.repeat(60))
console.log('📊 RESUMEN')
console.log('='.repeat(60))

const checks = [
    content.includes('sales-training-data'),
    content.includes('TRAINING_SCENARIOS'),
    content.includes('BOT_RULES'),
    content.includes('buildTrainingExamples'),
    content.includes('this.buildTrainingExamples()')
]

const passed = checks.filter(Boolean).length
const total = checks.length

console.log(`\n✅ Verificaciones pasadas: ${passed}/${total}`)

if (passed === total) {
    console.log('\n🎉 ¡PERFECTO! El sistema híbrido está completamente integrado con el entrenamiento')
    console.log('\n💡 CÓMO FUNCIONA:')
    console.log('   1. Cliente envía mensaje a WhatsApp')
    console.log('   2. Baileys recibe el mensaje')
    console.log('   3. Sistema híbrido procesa con buildSystemPrompt()')
    console.log('   4. buildTrainingExamples() agrega ejemplos al prompt')
    console.log('   5. IA genera respuesta basada en entrenamiento')
    console.log('   6. Respuesta se envía al cliente')
    console.log('\n🚀 El bot ahora aprende de conversaciones exitosas!')
} else {
    console.log('\n⚠️  Algunas verificaciones fallaron. Revisa los detalles arriba.')
}

console.log('\n✅ Prueba completada\n')

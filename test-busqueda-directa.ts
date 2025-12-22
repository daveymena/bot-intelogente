/**
 * Script para probar la búsqueda de cursos directamente
 */

import { Orchestrator } from './src/agents/orchestrator'

async function testBusquedaCursoPiano() {
  console.log('🎹 PROBANDO BÚSQUEDA DIRECTA DE CURSO DE PIANO\n')

  try {
    const orchestrator = new Orchestrator()

    // Simular mensaje del usuario
    const params = {
      chatId: 'test-chat-123',
      userId: 'test-user-123',
      message: 'curso de piano',
      userName: 'Test User'
    }

    console.log('📝 Mensaje del usuario:', params.message)
    console.log('🔍 Procesando con Orchestrator...\n')

    const result = await orchestrator.processMessage(params)

    console.log('✅ RESPUESTA DEL BOT:')
    console.log('📝 Texto:', result.text.substring(0, 200) + '...')

    if (result.actions && result.actions.length > 0) {
      console.log('⚡ ACCIONES GENERADAS:')
      result.actions.forEach((action: any, index: number) => {
        console.log(`  ${index + 1}. Tipo: ${action.type}`)
        if (action.product) {
          console.log(`     Producto: ${action.product.name}`)
          console.log(`     Es megapack: ${action.product.name.toLowerCase().includes('megapack') ? 'SÍ' : 'NO'}`)
        }
        if (action.data?.product) {
          console.log(`     Producto: ${action.data.product.name}`)
          console.log(`     Es megapack: ${action.data.product.name.toLowerCase().includes('megapack') ? 'SÍ' : 'NO'}`)
        }
      })
    }

    // Verificar si se encontraron megapacks
    const textLower = result.text.toLowerCase()
    const hasMegapack = textLower.includes('megapack') || textLower.includes('mega pack')

    console.log('\n📊 ANÁLISIS:')
    console.log('🎯 Contiene "curso":', textLower.includes('curso'))
    console.log('📦 Menciona megapack:', hasMegapack)
    console.log('📸 Tiene acciones:', result.actions?.length || 0)

    if (hasMegapack && !textLower.includes('curso de piano')) {
      console.log('\n❌ ERROR: Encontró megapacks en lugar del curso específico')
    } else if (textLower.includes('curso') && !hasMegapack) {
      console.log('\n✅ ÉXITO: Encontró curso individual')
    } else {
      console.log('\n⚠️  RESULTADO MIXTO: Revisar respuesta completa')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }

  console.log('\n' + '='.repeat(50))
}

// Ejecutar
testBusquedaCursoPiano()
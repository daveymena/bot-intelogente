import { AIService } from '../src/lib/ai-service'
import { db } from '../src/lib/db'

/**
 * 🧪 PROBAR CORRECCIÓN DEL BOT
 * 
 * Verifica que el bot responda correctamente:
 * 1. Links solo para productos digitales
 * 2. Contacto directo para productos físicos
 * 3. Respuestas correctas a solicitudes de fotos
 * 4. Memoria de contexto funcionando
 */

async function probarCorreccionBot() {
  console.log('🧪 Probando corrección del bot...\n')

  try {
    // Obtener usuario
    const user = await db.user.findFirst()
    if (!user) {
      console.error('❌ No se encontró usuario')
      return
    }

    console.log(`✅ Usuario: ${user.email}\n`)

    // Verificar que el prompt de reglas existe
    const reglasPrompt = await db.aIPrompt.findFirst({
      where: {
        userId: user.id,
        name: 'Reglas de Productos y Pagos'
      }
    })

    if (reglasPrompt) {
      console.log('✅ Prompt de reglas encontrado')
      console.log(`   Activo: ${reglasPrompt.isActive}`)
      console.log(`   Tipo: ${reglasPrompt.type}\n`)
    } else {
      console.log('⚠️  Prompt de reglas NO encontrado\n')
    }

    // PRUEBA 1: Link de producto físico (moto)
    console.log('📋 PRUEBA 1: Link de producto físico (moto)')
    console.log('   Mensaje: "Dame el link de la moto"\n')
    
    const respuesta1 = await AIService.generateResponse(
      user.id,
      'Dame el link de la moto',
      '+573042748687',
      []
    )

    console.log('   Respuesta:')
    console.log('   ' + respuesta1.message.split('\n').join('\n   '))
    
    // Verificar que NO contenga links de pago de Hotmart
    const tieneHotmart = respuesta1.message.includes('hotmart') || respuesta1.message.includes('pay.hotmart')
    const tieneContacto = respuesta1.message.includes('304 274 8687') || respuesta1.message.includes('3042748687')
    
    console.log(`\n   ✅ Verificación:`)
    console.log(`      ${tieneHotmart ? '❌' : '✅'} NO contiene link de Hotmart: ${!tieneHotmart}`)
    console.log(`      ${tieneContacto ? '✅' : '❌'} Contiene contacto directo: ${tieneContacto}`)
    console.log('\n' + '='.repeat(80) + '\n')

    // PRUEBA 2: Link de producto digital (curso de piano)
    console.log('📋 PRUEBA 2: Link de producto digital (curso de piano)')
    console.log('   Mensaje: "Dame el link del curso de piano"\n')
    
    const respuesta2 = await AIService.generateResponse(
      user.id,
      'Dame el link del curso de piano',
      '+573042748687',
      []
    )

    console.log('   Respuesta:')
    console.log('   ' + respuesta2.message.split('\n').join('\n   '))
    
    // Verificar que SÍ contenga link de Hotmart
    const tieneHotmart2 = respuesta2.message.includes('hotmart') || respuesta2.message.includes('pay.hotmart')
    
    console.log(`\n   ✅ Verificación:`)
    console.log(`      ${tieneHotmart2 ? '✅' : '❌'} Contiene link de Hotmart: ${tieneHotmart2}`)
    console.log('\n' + '='.repeat(80) + '\n')

    // PRUEBA 3: Solicitud de foto
    console.log('📋 PRUEBA 3: Solicitud de foto')
    console.log('   Mensaje: "Tienes foto de la laptop?"\n')
    
    const respuesta3 = await AIService.generateResponse(
      user.id,
      'Tienes foto de la laptop?',
      '+573042748687',
      []
    )

    console.log('   Respuesta:')
    console.log('   ' + respuesta3.message.split('\n').join('\n   '))
    
    // Verificar que ofrezca envío por WhatsApp y NO cita
    const ofreceWhatsApp = respuesta3.message.toLowerCase().includes('whatsapp')
    const ofreceCita = respuesta3.message.toLowerCase().includes('agendar') || 
                       respuesta3.message.toLowerCase().includes('visita') ||
                       respuesta3.message.toLowerCase().includes('venir')
    
    console.log(`\n   ✅ Verificación:`)
    console.log(`      ${ofreceWhatsApp ? '✅' : '❌'} Ofrece envío por WhatsApp: ${ofreceWhatsApp}`)
    console.log(`      ${!ofreceCita ? '✅' : '❌'} NO ofrece agendar cita: ${!ofreceCita}`)
    console.log('\n' + '='.repeat(80) + '\n')

    // PRUEBA 4: Contexto de conversación
    console.log('📋 PRUEBA 4: Contexto de conversación')
    console.log('   Mensaje 1: "Info de la moto"')
    console.log('   Mensaje 2: "Dame el link"\n')
    
    // Simular historial
    const historial = [
      { role: 'user' as const, content: 'Info de la moto' },
      { role: 'assistant' as const, content: 'Moto Bajaj Pulsar NS 160 FI (2020) - $6.500.000 COP' }
    ]
    
    const respuesta4 = await AIService.generateResponse(
      user.id,
      'Dame el link',
      '+573042748687',
      historial
    )

    console.log('   Respuesta:')
    console.log('   ' + respuesta4.message.split('\n').join('\n   '))
    
    // Verificar que hable de la moto y NO del curso de piano
    const hablaDeMoto = respuesta4.message.toLowerCase().includes('moto') || 
                        respuesta4.message.toLowerCase().includes('pulsar') ||
                        respuesta4.message.toLowerCase().includes('bajaj')
    const hablaDePiano = respuesta4.message.toLowerCase().includes('piano')
    const tieneContacto4 = respuesta4.message.includes('304 274 8687')
    
    console.log(`\n   ✅ Verificación:`)
    console.log(`      ${hablaDeMoto ? '✅' : '❌'} Habla de la moto: ${hablaDeMoto}`)
    console.log(`      ${!hablaDePiano ? '✅' : '❌'} NO habla del piano: ${!hablaDePiano}`)
    console.log(`      ${tieneContacto4 ? '✅' : '❌'} Ofrece contacto directo: ${tieneContacto4}`)
    console.log('\n' + '='.repeat(80) + '\n')

    // RESUMEN FINAL
    console.log('📊 RESUMEN DE PRUEBAS:\n')
    
    const prueba1OK = !tieneHotmart && tieneContacto
    const prueba2OK = tieneHotmart2
    const prueba3OK = ofreceWhatsApp && !ofreceCita
    const prueba4OK = hablaDeMoto && !hablaDePiano && tieneContacto4
    
    console.log(`   Prueba 1 (Link moto): ${prueba1OK ? '✅ PASÓ' : '❌ FALLÓ'}`)
    console.log(`   Prueba 2 (Link piano): ${prueba2OK ? '✅ PASÓ' : '❌ FALLÓ'}`)
    console.log(`   Prueba 3 (Foto laptop): ${prueba3OK ? '✅ PASÓ' : '❌ FALLÓ'}`)
    console.log(`   Prueba 4 (Contexto): ${prueba4OK ? '✅ PASÓ' : '❌ FALLÓ'}`)
    
    const todasPasaron = prueba1OK && prueba2OK && prueba3OK && prueba4OK
    
    console.log(`\n   ${todasPasaron ? '✅ TODAS LAS PRUEBAS PASARON' : '⚠️  ALGUNAS PRUEBAS FALLARON'}`)

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await db.$disconnect()
  }
}

probarCorreccionBot()

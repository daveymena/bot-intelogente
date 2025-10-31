import { db } from '../src/lib/db'
import { AIService } from '../src/lib/ai-service'

/**
 * Script para probar que el bot envía links REALES
 */

async function probarLinksReales() {
  try {
    console.log('🧪 Probando que el bot envía links REALES...\n')

    // Obtener usuario admin
    const admin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!admin) {
      console.error('❌ No se encontró usuario admin')
      return
    }

    console.log(`✅ Usuario encontrado: ${admin.email}\n`)

    // PRUEBA 1: Curso de Piano
    console.log('📝 PRUEBA 1: Curso de Piano')
    console.log('Pregunta: "Dame el link del curso de piano"\n')
    
    const response1 = await AIService.generateResponse(
      admin.id,
      'Dame el link del curso de piano',
      '+573001234567',
      []
    )

    console.log('Respuesta del bot:')
    console.log(response1.message)
    console.log('\n---\n')

    // Verificar que contiene el link real de Hotmart
    if (response1.message.includes('pay.hotmart.com/I95497720H')) {
      console.log('✅ CORRECTO: Contiene link real de Hotmart')
    } else {
      console.log('❌ ERROR: No contiene link real de Hotmart')
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // PRUEBA 2: Megapack
    console.log('📝 PRUEBA 2: Megapack')
    console.log('Pregunta: "Cómo pago el Mega Pack de Diseño Gráfico?"\n')
    
    const response2 = await AIService.generateResponse(
      admin.id,
      'Cómo pago el Mega Pack de Diseño Gráfico?',
      '+573001234567',
      []
    )

    console.log('Respuesta del bot:')
    console.log(response2.message)
    console.log('\n---\n')

    // Verificar que contiene Nequi o Payco
    if (response2.message.includes('3136174267') || response2.message.includes('payco.link')) {
      console.log('✅ CORRECTO: Contiene método de pago real (Nequi o Payco)')
    } else {
      console.log('❌ ERROR: No contiene método de pago real')
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // PRUEBA 3: Laptop
    console.log('📝 PRUEBA 3: Laptop')
    console.log('Pregunta: "Quiero comprar la laptop ASUS más barata"\n')
    
    const response3 = await AIService.generateResponse(
      admin.id,
      'Quiero comprar la laptop ASUS más barata',
      '+573001234567',
      []
    )

    console.log('Respuesta del bot:')
    console.log(response3.message)
    console.log('\n---\n')

    // Verificar que contiene contacto directo
    if (response3.message.includes('+57 304 274 8687') || response3.message.includes('304 274 8687')) {
      console.log('✅ CORRECTO: Contiene contacto directo')
    } else {
      console.log('❌ ERROR: No contiene contacto directo')
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // PRUEBA 4: Verificar que NO hay links genéricos
    console.log('📝 PRUEBA 4: Verificar que NO hay links genéricos\n')
    
    const allResponses = [response1.message, response2.message, response3.message]
    let hasGenericLinks = false

    for (const response of allResponses) {
      if (response.includes('example-') || 
          response.includes('mpago.la/example') || 
          response.includes('paypal.com/invoice/example') ||
          response.includes('(disponible)') && !response.includes('http')) {
        hasGenericLinks = true
        console.log('❌ ERROR: Encontrado link genérico o texto "disponible" sin link')
        break
      }
    }

    if (!hasGenericLinks) {
      console.log('✅ CORRECTO: No se encontraron links genéricos')
    }

    console.log('\n' + '='.repeat(60) + '\n')
    console.log('✅ Pruebas completadas\n')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await db.$disconnect()
  }
}

probarLinksReales()

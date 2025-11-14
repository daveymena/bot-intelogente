/**
 * Script para probar la detección de solicitudes de fotos
 * Verifica que el bot entienda cuando el cliente pide fotos del producto en contexto
 */

async function testPhotoRequest() {
  console.log('🧪 PRUEBA: Detección de Solicitudes de Fotos\n')

  // Casos de prueba
  const testCases = [
    'Me envía fotos?',
    'Me envia fotos',
    'Tiene fotos?',
    'Tienes fotos disponibles?',
    'Me manda fotos del producto',
    'Me pasa fotos',
    'Me muestra fotos',
    'Puedo ver fotos?',
    'Hay fotos?',
    'Foto',
    'Fotos',
    'Me envía imágenes?',
    'Tiene imágenes?',
    'Como se ve?',
    'Como luce?',
    'Ver fotos',
    'Quiero ver fotos',
    'Me envía',
    'Me manda',
    'Muestra'
  ]

  console.log('📋 Casos de prueba:\n')

  for (const testCase of testCases) {
    const normalized = testCase.toLowerCase().trim()
    
    // Patrones de solicitud de fotos
    const photoPatterns = [
      /\b(foto|fotos|imagen|imagenes|imágenes|pic|pics|picture|pictures)\b/i,
      /\b(me\s+(envía|envia|manda|pasa|muestra|enseña))\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(tiene|tienes|hay)\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(ver|mirar|revisar)\s+(foto|fotos|imagen|imagenes|imágenes)/i,
      /\b(foto|fotos|imagen|imagenes|imágenes)\s+(del|de|para|sobre)/i,
      /\b(cómo|como)\s+(se\s+ve|luce|es)/i,
      /\b(me\s+envía|me\s+envia|me\s+manda|me\s+pasa|me\s+muestra)\b/i
    ]
    
    let isPhotoRequest = false
    let confidence = 0
    
    // Verificar patrones fuertes
    for (const pattern of photoPatterns) {
      if (pattern.test(normalized)) {
        isPhotoRequest = true
        confidence = 0.95
        break
      }
    }
    
    // Patrones débiles
    if (!isPhotoRequest) {
      const weakPatterns = [
        /\b(ver|mirar|revisar)\b/i,
        /\b(muestra|enseña|pasa)\b/i
      ]
      
      for (const pattern of weakPatterns) {
        if (pattern.test(normalized) && normalized.length < 20) {
          isPhotoRequest = true
          confidence = 0.7
          break
        }
      }
    }
    
    const emoji = isPhotoRequest ? '✅' : '❌'
    const confidenceStr = confidence > 0 ? ` (${(confidence * 100).toFixed(0)}%)` : ''
    console.log(`${emoji} "${testCase}"${confidenceStr}`)
  }

  console.log('\n📊 Resumen:')
  console.log('✅ = Detectado como solicitud de fotos')
  console.log('❌ = NO detectado como solicitud de fotos')
  console.log('\n💡 Resultado esperado:')
  console.log('   - Todos los casos con "foto", "imagen", "me envía", etc. deben ser ✅')
  console.log('   - Casos ambiguos como "ver", "muestra" solos pueden ser ❌')
}

// Ejecutar prueba
testPhotoRequest()

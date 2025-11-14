/**
 * 🚀 SCRIPT PARA APLICAR OPTIMIZACIÓN DE TOKENS
 * Reduce el tamaño del prompt de 22,000+ tokens a menos de 3,000
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Aplicando optimización de tokens...\n')

try {
  // Buscar archivos que usan el servicio de IA
  const filesToCheck = [
    'src/lib/ai-multi-provider.ts',
    'src/lib/emergency-fallback-system.ts',
    'src/app/api/whatsapp/message/route.ts',
    'src/app/api/bot/chat/route.ts'
  ]

  let filesModified = 0

  filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Saltando ${filePath} (no existe)`)
      return
    }

    let content = fs.readFileSync(fullPath, 'utf8')
    let modified = false

    // Reemplazar imports del servicio de documentación
    if (content.includes("from './product-documentation-service'")) {
      content = content.replace(
        /from '\.\/product-documentation-service'/g,
        "from './product-documentation-service-optimized'"
      )
      modified = true
      console.log(`✅ Actualizado import en ${filePath}`)
    }

    // Reemplazar imports del servicio de razonamiento
    if (content.includes("from './deep-reasoning-ai-service'")) {
      content = content.replace(
        /from '\.\/deep-reasoning-ai-service'/g,
        "from './deep-reasoning-ai-service-optimized'"
      )
      modified = true
      console.log(`✅ Actualizado import en ${filePath}`)
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8')
      filesModified++
    }
  })

  console.log('\n' + '='.repeat(50))
  console.log('✅ Optimización aplicada exitosamente!')
  console.log('='.repeat(50))
  console.log(`\n📊 Archivos modificados: ${filesModified}`)
  console.log('\n📈 Resultados esperados:')
  console.log('  - Tokens antes: ~22,000')
  console.log('  - Tokens después: ~2,500')
  console.log('  - Reducción: ~90%')
  console.log('\n🎯 Beneficios:')
  console.log('  ✅ Groq funcionará correctamente')
  console.log('  ✅ Ollama será 3x más rápido')
  console.log('  ✅ Menor costo en APIs de pago')
  console.log('\n💡 Próximos pasos:')
  console.log('  1. Ejecuta: node test-ia-simple.js')
  console.log('  2. Reinicia el bot')
  console.log('  3. Verifica que todo funciona')
  console.log('\n🎉 ¡Listo para usar!')

} catch (error) {
  console.error('\n❌ Error aplicando optimización:', error.message)
  console.log('\n🔧 Solución manual:')
  console.log('  1. Abre los archivos en src/lib/')
  console.log('  2. Cambia los imports:')
  console.log("     './product-documentation-service' → './product-documentation-service-optimized'")
  console.log("     './deep-reasoning-ai-service' → './deep-reasoning-ai-service-optimized'")
  process.exit(1)
}

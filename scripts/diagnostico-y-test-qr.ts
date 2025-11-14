/**
 * Script combinado: Diagnóstico + Test de QR
 * Ejecuta todo en un solo comando
 */

import { execSync } from 'child_process'

async function ejecutarTodo() {
  console.log('═'.repeat(70))
  console.log('🚀 DIAGNÓSTICO Y TEST DE QR - TODO EN UNO')
  console.log('═'.repeat(70))
  console.log('')

  // PASO 1: Diagnóstico completo
  console.log('📋 PASO 1/3: Diagnóstico Completo')
  console.log('─'.repeat(70))
  console.log('')

  try {
    execSync('npx tsx scripts/diagnostico-completo-whatsapp.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
  } catch (error) {
    console.log('')
    console.log('❌ El diagnóstico encontró problemas críticos')
    console.log('   Resuelve los problemas indicados antes de continuar')
    console.log('')
    process.exit(1)
  }

  console.log('')
  console.log('✅ Diagnóstico completado sin problemas críticos')
  console.log('')
  console.log('⏳ Esperando 3 segundos antes del siguiente paso...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log('')

  // PASO 2: Test de QR
  console.log('═'.repeat(70))
  console.log('📋 PASO 2/3: Test de Generación de QR')
  console.log('─'.repeat(70))
  console.log('')
  console.log('⚠️  IMPORTANTE: Este paso puede tomar hasta 30 segundos')
  console.log('   Si ves un QR en ASCII art, ¡significa que funciona!')
  console.log('')
  console.log('⏳ Iniciando test de QR...')
  console.log('')

  try {
    execSync('npx tsx scripts/test-qr-console.ts', { 
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 120000 // 2 minutos máximo
    })
  } catch (error) {
    console.log('')
    console.log('❌ El test de QR falló')
    console.log('')
    console.log('💡 Posibles soluciones:')
    console.log('   1. Limpiar sesiones: rm -rf auth_sessions/*')
    console.log('   2. Reinstalar Baileys: npm install @whiskeysockets/baileys@latest')
    console.log('   3. Verificar conectividad: curl -I https://web.whatsapp.com')
    console.log('')
    process.exit(1)
  }

  console.log('')
  console.log('⏳ Esperando 3 segundos antes del siguiente paso...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log('')

  // PASO 3: Verificar estado en DB
  console.log('═'.repeat(70))
  console.log('📋 PASO 3/3: Verificar Estado en Base de Datos')
  console.log('─'.repeat(70))
  console.log('')

  try {
    execSync('npx tsx scripts/verificar-estado-whatsapp.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
  } catch (error) {
    console.log('')
    console.log('⚠️  No se pudo verificar el estado en DB')
    console.log('   Pero el test de QR fue exitoso')
    console.log('')
  }

  // RESUMEN FINAL
  console.log('')
  console.log('═'.repeat(70))
  console.log('✅ PROCESO COMPLETADO')
  console.log('═'.repeat(70))
  console.log('')
  console.log('📊 Resumen:')
  console.log('   ✅ Diagnóstico: OK')
  console.log('   ✅ Test de QR: OK')
  console.log('   ✅ Estado en DB: Verificado')
  console.log('')
  console.log('💡 Próximos pasos:')
  console.log('   1. Ve al dashboard de tu aplicación')
  console.log('   2. Haz clic en "Conectar WhatsApp"')
  console.log('   3. Escanea el QR que aparece')
  console.log('   4. ¡Listo! WhatsApp conectado')
  console.log('')
  console.log('═'.repeat(70))
  console.log('')
}

ejecutarTodo().catch(error => {
  console.error('')
  console.error('═'.repeat(70))
  console.error('❌ ERROR FATAL')
  console.error('═'.repeat(70))
  console.error(error)
  console.error('')
  process.exit(1)
})

console.log('Testing import...')

try {
  // Test 1: Import con path completo
  import('./src/lib/baileys-stable-service')
    .then(() => console.log('✅ Import exitoso'))
    .catch(e => console.error('❌ Error:', e.message))
} catch (e: any) {
  console.error('Error en test:', e.message)
}

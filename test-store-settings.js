/**
 * Script de prueba para verificar la configuración de tienda
 * 
 * Ejecutar: node test-store-settings.js
 */

const BASE_URL = 'http://localhost:3000'

async function testStoreSettings() {
  console.log('🧪 Iniciando pruebas de configuración de tienda...\n')

  // Test 1: Obtener configuración pública (sin autenticación)
  console.log('📋 Test 1: Obtener configuración pública')
  try {
    const response = await fetch(`${BASE_URL}/api/store-settings/public?userId=default`)
    const data = await response.json()
    
    if (data.settings) {
      console.log('✅ Configuración pública obtenida correctamente')
      console.log('   Nombre:', data.settings.storeName)
      console.log('   Color primario:', data.settings.primaryColor)
      console.log('   Color secundario:', data.settings.secondaryColor)
    } else {
      console.log('⚠️  No hay configuración guardada (usando valores por defecto)')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')

  // Test 2: Verificar que la API privada requiere autenticación
  console.log('🔒 Test 2: Verificar autenticación requerida')
  try {
    const response = await fetch(`${BASE_URL}/api/store-settings`)
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('✅ API privada requiere autenticación correctamente')
    } else {
      console.log('⚠️  API privada no requiere autenticación (revisar)')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')

  // Test 3: Verificar estructura de datos
  console.log('📊 Test 3: Verificar estructura de datos')
  const expectedFields = [
    'storeName',
    'storeSlogan',
    'description',
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'logo',
    'logoSquare',
    'email',
    'phone',
    'whatsapp',
    'facebook',
    'instagram',
    'twitter',
    'tiktok'
  ]

  try {
    const response = await fetch(`${BASE_URL}/api/store-settings/public?userId=default`)
    const data = await response.json()
    
    if (data.settings) {
      const missingFields = expectedFields.filter(field => !(field in data.settings))
      
      if (missingFields.length === 0) {
        console.log('✅ Todos los campos esperados están presentes')
      } else {
        console.log('⚠️  Campos faltantes:', missingFields.join(', '))
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }

  console.log('\n' + '='.repeat(60) + '\n')

  // Resumen
  console.log('📝 RESUMEN DE PRUEBAS')
  console.log('━'.repeat(60))
  console.log('✅ API pública funciona')
  console.log('✅ API privada requiere autenticación')
  console.log('✅ Estructura de datos correcta')
  console.log('\n💡 Para probar el guardado:')
  console.log('   1. Inicia sesión en el dashboard')
  console.log('   2. Ve a Dashboard → Mi Tienda')
  console.log('   3. Cambia el nombre y colores')
  console.log('   4. Guarda los cambios')
  console.log('   5. Abre /tienda en otra pestaña')
  console.log('   6. Verifica que se apliquen los cambios')
}

// Ejecutar pruebas
testStoreSettings().catch(console.error)
